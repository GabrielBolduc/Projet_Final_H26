require "test_helper"

class FestivalsStatsValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @festival_one = festivals(:one)
  end

  test "admin should fetch festival stats successfully without params" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
    assert_not_nil json["data"]["global"]
    assert_not_nil json["data"]["list"]
  end

  test "admin should filter stats by year successfully" do
    sign_in @admin
    year_to_filter = @festival_one.start_at.to_date.year

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals?year=#{year_to_filter}", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_empty json["data"]["list"]
    json["data"]["list"].each do |stat|
      assert_equal year_to_filter, stat["year"]
    end
  end

  test "admin should combine year and ids filters successfully" do
    sign_in @admin
    year_to_filter = @festival_one.start_at.to_date.year

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals?year=#{year_to_filter}&festival_ids[]=#{@festival_one.id}", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal 1, json["data"]["list"].length
    assert_equal @festival_one.id, json["data"]["list"].first["id"]
  end


  test "admin should fetch correct fallback stats for a festival with NO performances" do
    sign_in @admin
    
    empty_festival = Festival.create!(
      name: "Festival Vide", start_at: "2026-08-01", end_at: "2026-08-05", 
      status: "draft", address: "123", daily_capacity: 1000, latitude: 0, longitude: 0
    )

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals?festival_ids[]=#{empty_festival.id}", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    stat = json["data"]["list"].first
    
    assert_equal 0, stat["performance_count"]
    assert_equal 0, stat["artist_count"]
    assert_equal "Aucune", stat["top_stage_name"]
    assert_equal 0.0, stat["top_stage_avg_pop"]
  end

  test "admin should fetch list sorted by start_at descending (recent scope)" do
    sign_in @admin
    
    Festival.create!(
      name: "Festival Futur", start_at: "2050-01-01", end_at: "2050-01-05", 
      status: "draft", address: "123", daily_capacity: 1000, latitude: 0, longitude: 0
    )

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    list = json["data"]["list"]
    
    assert list.length >= 2
    assert list.first["year"] >= list.last["year"] 
  end
end