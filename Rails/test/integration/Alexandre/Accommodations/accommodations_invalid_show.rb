# test/integration/Alexandre/Accommodations/accommodations_invalid_show.rb
require "test_helper"

class Api::AccommodationsControllerInvalidShowTest < ActionDispatch::IntegrationTest
  def test_show_accommodation_not_found
    # Code http
    invalid_id = 999999
    get "/api/accommodations/#{invalid_id}", as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Resource not found", json_response["message"]

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
    assert_equal "Resource not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(id: 0)
  end
end
