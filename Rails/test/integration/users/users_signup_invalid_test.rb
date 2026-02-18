require "test_helper"

class UsersSignupInvalidTest < ActionDispatch::IntegrationTest
  setup do
    @existing_user = Client.create!(
      email: "existant@test.com",
      password: "qwerty",
      password_confirmation: "qwerty",
      name: "NOM",
      phone_number: "111-111-1111"
    )
  end

  # nom, role, phone_number manquant
  test "should fail signup with missing info" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_registration_url, params: {
        user: {
          email: "fail@user.com",
          password: "qwerty",
          password_confirmation: "qwerty"
        }
      }
    end

    # code http
    assert_response :success

    # format reponse
    assert_match "application/json", response.media_type
    json = JSON.parse(response.body)

    # donne repomse
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_includes json["errors"].to_s, "Name can't be blank"
  end

  # confirm mdp incorrect
  test "should fail signup with password mismatch" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_registration_url, params: {
        user: {
          email: "mismatch@test.com",
          name: "Mismatch Test",
          type: "Client",
          phone_number: "555-555-5555",
          password: "qwerty",
          password_confirmation: "asdfgh"
        }
      }
    end

    # code http
    assert_response :success

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_includes json["errors"].to_s, "Password confirmation doesn't match Password"
  end

  # email utiliser
  test "should fail signup with taken email" do
    # modif ou non
    assert_no_difference("User.count") do
      post user_registration_url, params: {
        user: {
          email: @existing_user.email,
          name: "Jean",
          type: "Client",
          phone_number: "222-222-2222",
          password: "qwerty",
          password_confirmation: "qwerty"
        }
      }
    end

    # code http
    assert_response :success

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_includes json["errors"].to_s, "Email has already been taken"
  end
end
