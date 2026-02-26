require "test_helper"

class PerformancesShowInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  
  setup do
    @performance = performances(:one)
  end

  # faux id
  test "should return 404 when performance is not found" do
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performance_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Performance introuvable.", json["message"]
  end

  test "should forbid access if performance is not ongoing and user is not admin" do
    @performance.festival.update!(status: "draft")
    
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performance_url(@performance), as: :json
    end

    # code http
    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Performance non publique", json["message"]
  end
end