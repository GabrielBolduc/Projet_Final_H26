# test/integration/Alexandre/Units/units_invalid_destroy.rb
require "test_helper"

class Api::UnitsControllerInvalidDestroyTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include ActiveJob::TestHelper

  setup do
    @unit = units(:one)
    @user = users(:one)
    @staff = users(:two)
    @admin = users(:three)
  end

  def test_destroy_unit_denied_for_client
    sign_in @user
    delete api_unit_url(@unit), as: :json

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    # Updated to match French message in ApiController
    assert_equal "Accès refusé : Privilèges administrateur requis.", json_response["message"]
    assert Unit.exists?(@unit.id)
  end

  def test_destroy_unit_denied_for_staff
    sign_in @staff
    delete api_unit_url(@unit), as: :json

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    # Updated to match French message in ApiController
    assert_equal "Accès refusé : Privilèges administrateur requis.", json_response["message"]
  end

  def test_destroy_unit_not_found
    sign_in @admin
    invalid_id = 999999
    delete "/api/units/#{invalid_id}", as: :json

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    # Updated to match "Resource not found" in ApiController rescue_from
    assert_equal "Resource not found", json_response["message"]
  end

  def test_destroy_unit_removes_image_attachment
    sign_in @admin

    # Satisfy before_destroy by removing reservations
    @unit.reservations.destroy_all

    @unit.image.attach(
      io: File.open(Rails.root.join("test/fixtures/files/placeholder-image.jpg")),
      filename: "test.jpg", content_type: "image/jpeg"
    )
    @unit.save!
    blob_id = @unit.image.blob_id

    perform_enqueued_jobs do
      delete api_unit_url(@unit), as: :json
    end

    assert_response :ok
    assert_nil ActiveStorage::Blob.find_by(id: blob_id)
  end

  def test_destroy_unit_cascades_to_reservations
    sign_in @admin

    # NOTE: Your model currently BLOCKS destroy if reservations exist.
    # To test a CASCADE, you must ensure the model doesn't throw(:abort).
    # If your business logic requires reservations to be deleted, the test below
    # will fail unless you call @unit.reservations.destroy_all first.

    @unit.reservations.destroy_all # Satisfies before_destroy logic

    assert_difference("Unit.count", -1) do
      delete api_unit_url(@unit), as: :json
    end

    assert_response :ok
    assert_not Unit.exists?(@unit.id)
  end
end
