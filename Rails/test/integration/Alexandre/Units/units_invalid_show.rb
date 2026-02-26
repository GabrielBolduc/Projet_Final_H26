# test/integration/Alexandre/Units/units_invalid_show.rb
require "test_helper"

class Api::UnitsControllerInvalidShowTest < ActionDispatch::IntegrationTest
  setup do
    @unit = units(:one)
  end

  def test_show_unit_not_found
    # Code http
    invalid_id = 999999
    get api_unit_url(id: invalid_id), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Unit not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(id: invalid_id)
  end

  def test_show_unit_with_invalid_id_format
    # Code http
    get "/api/units/not-an-id", as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Unit not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(id: "not-an-id")
  end
end
