require "test_helper"

class TicketingStatsInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @festival_one = festivals(:one)
    @festival_two = festivals(:two)
    @festival_three = festivals(:three)
  end

  test "should return error when normal user tries to access stats" do
    sign_in @client

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
  end

  test "should return error when guest (not logged in) tries to access stats" do
    # Aucun sign_in ici

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal "Accès refusé : Privilèges administrateur requis.", json["message"]
  end

  test "invalid date params are ignored and return all festivals" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?start_date=invalid-date", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }.sort
    expected = [ @festival_one.id, @festival_two.id, @festival_three.id ].sort
    assert_equal expected, ids
  end

  test "invalid category params are ignored and return all festivals" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?categories=unknown,invalid", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }.sort
    expected = [ @festival_one.id, @festival_two.id, @festival_three.id ].sort
    assert_equal expected, ids
  end
end
