require "test_helper"

class Api::AccommodationsStatsControllerInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
  end

  test "returns no results for the specific non-existent accommodation name" do
    sign_in @admin

    # Code http
    get "/api/stats/accommodations",
        params: { name: "Imaginary Hotel" },
        as: :json,
        headers: { "REQUEST_METHOD" => "GET" }
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    all_returned_names = json["data"].values.flat_map { |fest| fest["items"].map { |i| i["name"] } }
    assert_not_includes all_returned_names, "Imaginary Hotel"

    assert_not_empty json["data"], "The API returns other hotels when search doesn't match"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Imaginary Hotel")
  end
end
