require "test_helper"

class FestivalsUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @festival = festivals(:one)
  end

  test "should return 404 when updating non-existent festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(id: 999999), params: { festival: { name: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should forbid update if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { name: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { name: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with name longer than 100 chars" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { name: "a" * 101 } }, as: :json
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
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { start_at: nil } }, as: :json
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
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { end_at: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil status" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { status: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil address" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { address: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { daily_capacity: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with zero daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { daily_capacity: 0 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with decimal daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { daily_capacity: 100.5 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with satisfaction out of bounds" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { satisfaction: -1 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with non-numeric expense" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { other_expense: "abc" } }, as: :json
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
    assert_no_difference("Festival.count") do
      put api_festival_url(@festival), params: { festival: { start_at: "2027-07-05", end_at: "2027-07-01" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update a second festival to ongoing" do
    sign_in @admin
    draft_festival = festivals(:two) 

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(draft_festival), params: { festival: { status: "ongoing" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end
end