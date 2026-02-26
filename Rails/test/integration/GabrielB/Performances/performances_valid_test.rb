require "test_helper"

class PerformancesValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @performance = performances(:one)

    @valid_params = {
      performance: {
        title: "Show valid",
        description: "Un bon show",
        price: 59.99,
        start_at: "2026-08-02T20:00:00Z", 
        end_at: "2026-08-02T22:00:00Z",
        artist_id: artists(:one).id,
        stage_id: stages(:one).id,
        festival_id: festivals(:one).id
      }
    }
  end

  test "public should list only ongoing performances" do
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performances_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "admin should list all performances" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performances_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "should filter performances by festival_id" do
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performances_url(festival_id: festivals(:one).id), as: :json
    end
    
    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "should show a specific public performance" do
    # modif ou non
    assert_no_difference("Performance.count") do
      get api_performance_url(@performance), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @performance.title, json["data"]["title"]
  end

  test "admin should create a new performance" do
    sign_in @admin

    # modif ou non
    assert_difference("Performance.count", 1) do
      post api_performances_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Show valid", json["data"]["title"]
  end

  test "admin should update a performance" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      put api_performance_url(@performance), params: { performance: { title: "Titre Modifié" } }, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Titre Modifié", json["data"]["title"]
  end
  
  test "admin should delete a performance" do
    sign_in @admin

    # modif ou non
    assert_difference("Performance.count", -1) do
      delete api_performance_url(@performance), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Performance supprimée avec succes", json["message"]
    assert_nil json["data"]
  end
end