require "test_helper"

class PerformancesShowInvalidTest < ActionDispatch::IntegrationTest
  
  # faux id
  test "should return 404 when performance is not found" do
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performance_url(id: 999999), as: :json
    end

    # code http
    assert_response :not_found

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
    assert_equal "Performance not found", json["message"]
  end
end