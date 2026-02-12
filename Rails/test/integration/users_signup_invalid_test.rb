require "test_helper"

class UsersSignupInvalidTest < ActionDispatch::IntegrationTest
  test "should fail signup with missing info" do
    assert_no_difference("User.count") do
      post user_registration_url, params: {
        # manque name role phone_number
        user: {
          email: "fail@user.com",
          password: "qwerty",
          password_confirmation: "qwerty"
        }
      }
    end

    assert_response :success 

    assert_match "application/json", response.media_type
    json = JSON.parse(response.body)

    assert_equal "error", json["status"]
    assert_equal 422, json["code"] 
    assert_includes json["errors"].to_s, "Name can't be blank"
  end
end