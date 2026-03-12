require "test_helper"

class FestivalsStatsInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
  end

  test "should return error when normal user tries to access stats" do
    sign_in @client

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
  end

  test "should return error when guest (not logged in) tries to access stats" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal "Accès refusé : Privilèges administrateur requis.", json["message"]
  end

  test "should return empty list when filtering by non-existent year" do
    admin = users(:three)
    sign_in admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals?year=3000", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_empty json["data"]["list"]
  end

  test "should return empty list when filtering by non-existent festival ids" do
    admin = users(:three)
    sign_in admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/festivals?festival_ids[]=999999", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_empty json["data"]["list"]
  end
end
