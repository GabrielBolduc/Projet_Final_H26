require "test_helper"

class PerformancesUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    
    @performance = performances(:one)
    @performance_two = performances(:two) 
  end

  test "should return 404 when updating non-existent performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(id: 999999), params: { performance: { title: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should forbid update if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { title: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil title" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { title: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with title longer than 20 characters" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { title: "a" * 21 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil start_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { start_at: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil end_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { end_at: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil price" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { price: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with negative price" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { price: -5.0 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end


  test "should fail to update without an artist" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { artist_id: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update without a stage" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { stage_id: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update without a festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { festival_id: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail if end_at is before start_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { start_at: "2026-08-01 20:00:00", end_at: "2026-08-01 18:00:00" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail if dates are outside festival dates" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { start_at: "2099-01-01 20:00:00", end_at: "2099-01-01 22:00:00" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail if stage overlaps with another performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { 
        performance: { 
          stage_id: @performance_two.stage_id, 
          start_at: @performance_two.start_at, 
          end_at: @performance_two.end_at 
        } 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail if artist overlaps with another performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { 
        performance: { 
          artist_id: @performance_two.artist_id, 
          start_at: @performance_two.start_at, 
          end_at: @performance_two.end_at 
        } 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end
end