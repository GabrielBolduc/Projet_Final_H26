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

  test "should not login with invalid credentials" do
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          email: @user.email,
          password: "WRONG_PASSWORD"
        }
      }, as: :json
    end

    assert_response :success 

    json = JSON.parse(response.body)

    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
  end
end