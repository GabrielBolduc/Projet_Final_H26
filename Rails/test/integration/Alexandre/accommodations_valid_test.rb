require "test_helper"

class AccommodationValidTest < ActionDispatch::IntegrationTest
  setup do
    @unit = units(:one)

    @unit.image.attach(
      io: File.open(Rails.root.join("test/fixtures/files/placeholder-image.png")),
      filename: "placeholder-image.png",
      content_type: "image/png"
    )
  end

test "should show unit details with coordinates" do
  get api_accommodation_url(@unit), as: :json

  # Code http
  assert_response :success

  # Format json valide
  json = JSON.parse(response.body)
  assert_equal "success", json["status"]

  # Contenu du format json
  assert_equal @unit.id, json["data"]["id"]
  
  # Validation of the nested accommodation object
  assert_not_nil json["data"]["accommodation"], "Accommodation object is missing from response"
  assert_not_nil json["data"]["accommodation"]["coordinates"], "Coordinates are missing from accommodation object"
end

  test "should handle non-existent unit" do
    get api_accommodation_url(id: 999999), as: :json

    # Code http
    # The server returned 404, so we assert :not_found
    assert_response :not_found

    # Format json valide
    json = JSON.parse(response.body)

    # Contenu du format json
    # Based on your response body: {"error": "not_found"}
    assert_equal "not_found", json["error"]
  end
end