# test/integration/Alexandre/Accommodations/accommodations_invalid_update.rb
require "test_helper"

class Api::AccommodationsControllerInvalidUpdateTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three) 
    @user = users(:one) # Client
    @accommodation = accommodations(:one) # Grand Hotel
  end

  def test_update_denied_for_non_admin
    sign_in @user

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { name: "Hacker's Hideout" }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Access denied: Admin privileges required.", json_response["message"]

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_equal "Grand Hotel", @accommodation.name
  end

  def test_update_fails_with_excessive_commission
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { commission: 35.00 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be less than 30"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_not_equal 35.00, @accommodation.commission.to_f
  end

  def test_update_fails_with_blank_name_after_strip
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { name: "   " }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "Name can't be blank"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_equal "Grand Hotel", @accommodation.name
  end

  def test_update_fails_with_invalid_coordinates
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { latitude: nil, longitude: nil }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    messages = Array(json_response["message"]).join(", ")
    assert_includes messages, "Latitude can't be blank"
    assert_includes messages, "Longitude can't be blank"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_not_nil @accommodation.latitude
  end

  def test_update_ignores_unpermitted_params
    sign_in @admin
    original_id = @accommodation.id
    original_festival_id = @accommodation.festival_id

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { id: 9999, festival_id: 8888 }
    }, as: :json

    # Format json valide
    assert_response :success

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_equal original_id, @accommodation.id
    assert_equal original_festival_id, @accommodation.festival_id
  end

  def test_update_fails_with_negative_commission
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { commission: -5.0 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "greater than or equal to 0"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_operator @accommodation.commission, :>=, 0
  end

  def test_update_fails_with_too_long_name
    sign_in @admin
    long_name = "A" * 101

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { name: long_name }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "is too long"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_not_equal long_name, @accommodation.name
  end

  def test_update_fails_with_invalid_time_format
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { time_car: "not-a-time", time_walk: "invalid" }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "can't be blank"

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_not_nil @accommodation.time_car
  end

  def test_update_fails_with_invalid_category_enum
    sign_in @admin

    # Code http
    assert_raises(ArgumentError) do
      patch api_accommodation_url(@accommodation), params: {
        accommodation: { category: "spaceship" }
      }, as: :json
    end

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_equal "hotel", @accommodation.category
  end

  def test_update_strips_whitespace_from_fields
    sign_in @admin
    messy_name = "   Renovated Hotel   "

    # Code http
    patch api_accommodation_url(@accommodation), params: {
      accommodation: { name: messy_name }
    }, as: :json

    # Format json valide
    assert_response :ok

    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_equal "Renovated Hotel", @accommodation.name
  end

    def test_update_ignores_festival_id_change
        sign_in @admin
        original_festival_id = @accommodation.festival_id
        other_festival = festivals(:two)

        # Code http
        patch api_accommodation_url(@accommodation), params: {
            accommodation: { festival_id: other_festival.id }
        }, as: :json

        # Format json valide
        assert_response :success 

        # Validation de la cohérence de la base de données
        @accommodation.reload
        assert_equal original_festival_id, @accommodation.festival_id, "Festival ID should not be modifiable"
    end

    def test_update_fails_with_blank_time_durations
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation), params: {
        accommodation: { time_car: "", time_walk: nil }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "error", json_response["status"]
    
    # Validation de la cohérence de la base de données
    @accommodation.reload
    assert_not_nil @accommodation.time_car
    end

    def test_update_category_consistency_with_units
        sign_in @admin
        patch api_accommodation_url(@accommodation), params: {
            accommodation: { category: 0 }
        }, as: :json

        # Contenu du format json
        assert_equal "success", JSON.parse(response.body)["status"] 
    end
end
