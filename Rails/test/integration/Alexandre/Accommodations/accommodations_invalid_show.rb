# test/integration/Alexandre/Accommodations/accommodations_invalid_show.rb
require "test_helper"

class Api::AccommodationsControllerInvalidShowTest < ActionDispatch::IntegrationTest

  def test_show_accommodation_not_found
    # Code http
    invalid_id = 999999
    get api_accommodation_url(id: invalid_id), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Accommodation not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(id: invalid_id)
  end

  def test_show_accommodation_with_invalid_id_format
    # Code http
    get "/api/accommodations/not-an-id", as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Accommodation not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(id: "not-an-id")
  end

  def test_show_accommodation_excludes_timestamps
    @accommodation = accommodations(:one)

    # Code http
    get api_accommodation_url(@accommodation), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_nil json_response["data"]["created_at"], "created_at should be excluded from the response"
    assert_nil json_response["data"]["updated_at"], "updated_at should be excluded from the response"
    assert_not_nil json_response["data"]["name"]

    # Validation de la cohérence de la base de données
    assert_equal @accommodation.id, json_response["data"]["id"]
  end
end
