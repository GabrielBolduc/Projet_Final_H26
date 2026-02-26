# test/integration/Alexandre/Units/units_invalid_update.rb
require "test_helper"

class Api::UnitsControllerInvalidUpdateTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @unit = units(:one) # SimpleRoom at Grand Hotel
    @user = users(:one) # Client
    @admin = users(:three)
    @image = fixture_file_upload('placeholder-image.jpg', 'image/jpeg')
    
    @unit.image.attach(@image)
    @unit.save!

    sign_in @admin
  end

  def test_update_unit_denied_for_client
    sign_in @user

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { quantity: 50 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_match /Access denied/, json_response["message"]

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_equal 50, @unit.quantity
  end

  def test_update_fails_with_invalid_data_as_admin
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { quantity: 150, cost_person_per_night: -10.0 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    error_msg = Array(json_response["message"]).join(" ")
    assert_includes error_msg, "must be less than or equal to 100"
    assert_includes error_msg, "must be greater than or equal to 0"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_equal 150, @unit.quantity
    assert_not_equal -10.0, @unit.cost_person_per_night.to_f
  end

  def test_update_fails_changing_type_to_invalid_category
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
        unit: { type: "Units::StandardTerrain" }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "cannot be a terrain for a hotel"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_equal "Units::SimpleRoom", @unit.type
  end

  def test_update_ignores_accommodation_id_change
    sign_in @admin
    @other_accommodation = accommodations(:two)

    # Code http
    patch api_unit_url(@unit), params: {
        unit: { accommodation_id: @other_accommodation.id }
    }, as: :json

    # Format json valide
    assert_response :success

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_equal accommodations(:one).id, @unit.accommodation_id
  end

  def test_update_fails_with_invalid_quantity
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { quantity: 0 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be greater than 0"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_equal 0, @unit.quantity
  end

  def test_update_fails_with_excessive_quantity
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { quantity: 500 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be less than or equal to 100"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_equal 500, @unit.quantity
  end

  def test_update_fails_with_negative_parking_cost
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { parking_cost: -50.0 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be greater than or equal to 0"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_equal -50.0, @unit.parking_cost.to_f
  end

  def test_update_fails_with_invalid_food_options
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { food_options: ["Illegal Pizza"] }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "contains invalid values"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_not_includes @unit.food_options_as_array, "Illegal Pizza"
  end

  def test_update_ignores_unpermitted_params
    sign_in @admin
    original_created_at = @unit.created_at

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { created_at: 1.year.ago, id: 9999 }
    }, as: :json

    # Format json valide
    assert_response :success

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_equal original_created_at.to_i, @unit.created_at.to_i
    assert_not_equal 9999, @unit.id
  end
end
