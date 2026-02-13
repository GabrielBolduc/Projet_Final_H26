require "test_helper"

class UsersLoginInvalidTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "test@test.com",
      password: "qwerty",
      password_confirmation: "qwerty",
      name: "test",
      role: "CLIENT",
      phone_number: "444-444-4444"
    )
  end

  # mauvais mdp
  test "should not login with invalid password" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          email: @user.email,
          password: "asdfgh"
        }
      }, as: :json
    end

    # code http
    assert_response :success 

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
  end

  # faux email
  test "should not login with non-existent email" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          email: "unknown@test.com",
          password: "qwerty"
        }
      }, as: :json
    end

    # code http
    assert_response :success 

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
  end

  # login sans email
  test "should not login with missing email" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          password: "qwerty"
        }
      }, as: :json
    end

    # code http
    assert_response :success 

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
  end

  # login sans mdp
  test "should not login with missing password" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          email: @user.email
        }
      }, as: :json
    end

    # code http
    assert_response :success 

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
  end
end