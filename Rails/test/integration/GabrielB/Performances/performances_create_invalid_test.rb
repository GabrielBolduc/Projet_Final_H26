require "test_helper"

class PerformancesCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    
    @existing_performance = performances(:one)

    @valid_params = {
      title: "Show valid",
      price: 59.99,
      start_at: "2026-08-02T20:00:00Z",
      end_at: "2026-08-02T22:00:00Z",
      artist_id: artists(:one).id,
      stage_id: stages(:one).id,
      festival_id: festivals(:one).id
    }
  end


  test "should forbid creation if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Accès refusé : Privilèges administrateur requis.", json["message"]
  end

  test "should fail to create with nil title" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(title: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Échec de la validation", json["message"]
    assert_not_nil json["errors"]
  end

  test "should fail to create with title longer than 20 characters" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(title: "a" * 21) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil start_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(start_at: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil end_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(end_at: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil price" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(price: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with negative price" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(price: -15.50) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end


  test "should fail to create without an artist" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(artist_id: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create without a stage" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(stage_id: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create without a festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { performance: @valid_params.merge(festival_id: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end


  test "should fail to create if end_at is before start_at" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { 
        performance: @valid_params.merge(start_at: "2026-08-02T20:00:00Z", end_at: "2026-08-02T18:00:00Z") 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create if dates are outside festival dates" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { 
        performance: @valid_params.merge(start_at: "2099-01-01T20:00:00Z", end_at: "2099-01-01T22:00:00Z") 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create if stage overlaps with another performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { 
        performance: @valid_params.merge(
          stage_id: @existing_performance.stage_id, 
          start_at: @existing_performance.start_at, 
          end_at: @existing_performance.end_at
        ) 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create if artist overlaps with another performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: { 
        performance: @valid_params.merge(
          artist_id: @existing_performance.artist_id, 
          start_at: @existing_performance.start_at, 
          end_at: @existing_performance.end_at
        ) 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create if festival is completed" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do

      post api_performances_url, params: { 
        performance: @valid_params.merge(
          festival_id: festivals(:two).id,
          start_at: "2025-07-05T20:00:00Z", 
          end_at: "2025-07-05T22:00:00Z"
        ) 
      }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end
end