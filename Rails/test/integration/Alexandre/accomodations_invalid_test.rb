require "test_helper"

class AccommodationsInvalidTest < ActionDispatch::IntegrationTest
  test "should return error when showing non-existent unit" do
    get api_accommodation_url(id: 99999), as: :json

    # Code http
    assert_response :success 

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]

    # Contenu du format json
    assert_equal "Unit not found", json["message"]
  end
end