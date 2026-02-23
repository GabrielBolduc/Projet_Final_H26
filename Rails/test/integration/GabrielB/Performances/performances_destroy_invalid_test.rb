require "test_helper"

class PerformancesDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @performance = performances(:one)
  end

  test "should return 404 when deleting non-existent performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      delete api_performance_url(id: 999999), as: :json
    end

    # code http
    assert_response :success

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
  end

  test "should forbid deletion if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Performance.count") do
      delete api_performance_url(@performance), as: :json
    end

    # code http
    assert_response :success

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
  end
end