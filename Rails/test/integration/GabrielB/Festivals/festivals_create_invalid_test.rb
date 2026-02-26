require "test_helper"

class FestivalsCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    
    @valid_params = {
      name: "Festival Invalide",
      start_at: "2027-07-01",
      end_at: "2027-07-05",
      status: "draft",
      address: "123 Rue",
      daily_capacity: 5000
    }
  end

  test "should forbid creation if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(name: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with name longer than 100 chars" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(name: "a" * 101) }, as: :json
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
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(start_at: nil) }, as: :json
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
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(end_at: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil status" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(status: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil address" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(address: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(daily_capacity: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with zero daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(daily_capacity: 0) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with decimal daily_capacity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(daily_capacity: 50.5) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with satisfaction out of bounds" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(satisfaction: 6) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with non-numeric income" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(other_income: "abc") }, as: :json
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
      post api_festivals_url, params: { festival: @valid_params.merge(start_at: "2027-07-05", end_at: "2027-07-01") }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create a second ongoing festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      post api_festivals_url, params: { festival: @valid_params.merge(status: "ongoing") }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end
end