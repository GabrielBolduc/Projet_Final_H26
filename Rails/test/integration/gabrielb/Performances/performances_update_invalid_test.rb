require "test_helper"

class PerformancesUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @performance = performances(:one)

    @invalid_params = {
      performance: {
        title: nil
      }
    }
  end

  test "should return 404 when updating non-existent performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(id: 999999), params: { performance: { title: "Test" } }, as: :json
    end

    # code http
    assert_response :not_found

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
  end

  test "should forbid update if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { title: "Test" } }, as: :json
    end

    # code http
    assert_response :forbidden

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
  end

  test "should fail to update with invalid data" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: @invalid_params, as: :json
    end

    # code http
    assert_response :unprocessable_entity

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_not_nil json["errors"]
  end
end