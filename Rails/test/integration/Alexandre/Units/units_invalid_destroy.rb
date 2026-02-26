# test/integration/Alexandre/Units/units_invalid_destroy.rb
require "test_helper"

class Api::UnitsControllerInvalidDestroyTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include ActiveJob::TestHelper

  setup do
    @unit = units(:one) # SimpleRoom at Grand Hotel
    @user = users(:one)  # Client
    @staff = users(:two) # Staff
  end

  def test_destroy_unit_denied_for_client
    sign_in @user

    # Code http
    delete api_unit_url(@unit), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_match /Access denied/, json_response["message"]

    # Validation de la cohérence de la base de données
    assert Unit.exists?(@unit.id)
  end

  def test_destroy_unit_denied_for_staff
    sign_in @staff

    # Code http
    delete api_unit_url(@unit), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes json_response["message"], "Admin privileges required"

    # Validation de la cohérence de la base de données
    assert Unit.exists?(@unit.id)
  end

  def test_destroy_unit_not_found
    @admin = users(:three)
    sign_in @admin

    # Code http
    invalid_id = 999999
    delete "/api/units/#{invalid_id}", as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Unit not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(id: invalid_id)
  end

  def test_destroy_unit_removes_image_attachment
    admin_user = users(:three)
    sign_in admin_user
    target_unit = units(:one) 
    
    # Attach image and save
    target_unit.image.attach(
      io: File.open(Rails.root.join('test/fixtures/files/placeholder-image.jpg')),
      filename: 'placeholder-image.jpg',
      content_type: 'image/jpeg'
    )
    target_unit.save!
    blob_id = target_unit.image.blob_id

    # Code http
    perform_enqueued_jobs do
      delete api_unit_url(target_unit), as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]

    # Validation de la cohérence de la base de données
    assert_not Unit.exists?(target_unit.id)
    assert_nil ActiveStorage::Blob.find_by(id: blob_id), "Active Storage Blob was not cleaned up"
  end

  def test_destroy_unit_cascades_to_reservations
    @admin = users(:three)
    sign_in @admin
    unit_to_kill = units(:one) 
    reservation_to_kill = reservations(:one)

    # Code http
    assert_difference(["Unit.count", "Reservation.count"], -1) do
      delete api_unit_url(unit_to_kill), as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]

    # Validation de la cohérence de la base de données
    assert_not Unit.exists?(unit_to_kill.id), "Unit was not deleted"
    assert_not Reservation.exists?(reservation_to_kill.id), "Reservation was not cascaded"
  end
end
