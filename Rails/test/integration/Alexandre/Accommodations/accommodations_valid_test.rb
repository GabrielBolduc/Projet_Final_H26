# test/integration/Alexandre/Accommodations/accommodations_test_valid.rb
require "test_helper"

class Api::AccommodationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three) # Admin
    @accommodation_ongoing = accommodations(:one) # Grand Hotel (Festival ongoing)
    @accommodation_completed = accommodations(:two) # Forest Camping (Festival completed)
  end

  def test_index_shows_only_ongoing_festivals
    # Code http
    get api_accommodations_url, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    returned_names = json_response["data"].map { |a| a["name"] }
    assert_includes returned_names, "Grand Hotel"
    assert_not_includes returned_names, "Forest Camping"

    # Validation de la cohérence de la base de données
    assert_equal 1, json_response["data"].size
  end

  def test_index_filter_by_category
    # Code http
    get api_accommodations_url(category: 1), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert json_response["data"].all? { |a| a["category"] == "hotel" }

    # Validation de la cohérence de la base de données
    assert_equal 1, json_response["data"].size
    assert_equal "Grand Hotel", json_response["data"].first["name"]
  end

  def test_show_accommodation_success
    # Code http
    get api_accommodation_url(@accommodation_ongoing), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal @accommodation_ongoing.name, json_response["data"]["name"]
    assert_nil json_response["data"]["created_at"]

    # Validation de la cohérence de la base de données
    assert_equal @accommodation_ongoing.id, json_response["data"]["id"]
  end

  def test_create_accommodation_as_admin
    sign_in @admin

    # Code http
    assert_difference("Accommodation.count", 1) do
      post api_accommodations_url, params: {
        accommodation: {
          name: "New Jazz Inn",
          category: 1,
          address: "456 Blues Ave",
          latitude: 45.5,
          longitude: -73.5,
          shuttle: true,
          time_car: "00:10:00",
          time_walk: "00:40:00",
          commission: 12.0
        }
      }, as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "New Jazz Inn", json_response["data"]["name"]

    # Validation de la cohérence de la base de données
    new_acc = Accommodation.last
    assert_equal festivals(:one).id, new_acc.festival_id
  end

  def test_update_accommodation_as_admin
    sign_in @admin

    # Code http
    patch api_accommodation_url(@accommodation_ongoing), params: {
      accommodation: { name: "Grand Hotel Renovated", commission: 20.0 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "Grand Hotel Renovated", json_response["data"]["name"]

    # Validation de la cohérence de la base de données
    @accommodation_ongoing.reload
    assert_equal 20.0, @accommodation_ongoing.commission.to_f
  end

  def test_destroy_accommodation_as_admin
    sign_in @admin

    # Code http
    assert_difference("Accommodation.count", -1) do
      delete api_accommodation_url(@accommodation_ongoing), as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "Accommodation deleted", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_not Accommodation.exists?(@accommodation_ongoing.id)
  end
end
