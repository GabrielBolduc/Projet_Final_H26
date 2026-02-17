require "test_helper"

class UsersValidFlowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers 

  setup do
    @user = Client.create!(
      email: "test@test.com",
      password: "qwerty",
      password_confirmation: "qwerty",
      name: "test",
      phone_number: "444-444-4444"
    )
  end

  # Signup
  test "should signup a new user successfully" do
    assert_difference("Client.count", 1) do
      post user_registration_url, params: {
        user: {
          email: "user@user.com",
          password: "qwerty",
          password_confirmation: "qwerty",
          name: "Bob",
          phone_number: "222-222-2222",
          type: "Client"
        }
      }
    end
    
    assert_response :success
    
    assert_match "application/json", response.media_type # Vérifie que c'est bien du JSON
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]
    assert_equal "user@user.com", json["data"]["email"]
    assert_equal "Bob", json["data"]["name"]
    assert_equal "Client", json["data"]["type"]
  end

  # Login
  test "should login with valid credentials" do
    assert_no_difference("User.count") do
      post user_session_url, params: {
        user: {
          email: @user.email,
          password: "qwerty"
        }
      }
    end
    
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]
    assert_equal @user.email, json["data"]["user"]["email"]
    assert_equal "Client", json["data"]["user"]["type"]
  end

  # Logout
  test "should logout successfully" do
    sign_in @user 

    delete destroy_user_session_url

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end
end