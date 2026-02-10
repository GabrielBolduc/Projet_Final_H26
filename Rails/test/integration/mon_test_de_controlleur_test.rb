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

  # create
  test "should signup a new user" do
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
    json = JSON.parse(response.body)

    assert_equal "success", json["status"] 

    assert_equal "user@user.com", json["data"]["email"]
    assert_equal "Bob", json["data"]["name"]
    assert_equal "CLIENT", json["data"]["role"]
  end

  # create error
  test "should fail signup with missing info" do 
    post user_registration_url, params: {
      user: {
        email: "test@user.com",
        password: "qwerty",
        password: "qwerty"
      }
    }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_includes json["errors"].to_s, "Name can't be blank"
  end

  # Login
  test "should login with valid crendentials" do
    post user_session_url, params: {
      user: {
        email: @user.email,
        password: "qwerty"
      }
    }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]

    assert_equal @user.email, json["data"]["user"]["email"]
    assert_equal "CLIENT", json["data"]["user"]["role"]
  end

  # Login error
  test "should not login with invalid credentials" do
    post user_session_url, params: {
      user: {
        email: @user.email,
        password: "123456"
      }
    }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal "error", json["status"]
    assert_equal 401, json["code"]
    assert_equal "Invalid login credentials", json["message"]
  end

  # Logout
  test "should logout" do
    sign_in @user

    delete destroy_user_session_url

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end
end
