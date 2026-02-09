require "test_helper"

class MonTestDeControlleurTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "test@test.com", 
      password: "qwerty", 
      password_confirmation: "qwerty", 
      name: "test", 
      role: "CLIENT"
    )
  end

  test "should sign up a new user" do
    post user_registration_url, params: {
      user: {
        email: "user@user.com",
        password: "qwerty",
        password_confirmation: "qwerty",
        name: "Bob",
        phone_number: "222-222-2222",
        role: "CLIENT"
      }
    }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_equal true, json_response["success"]
    assert_equal "user@user.com", json_response["email"]
  end
end
