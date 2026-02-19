require "test_helper"

class PackagesCreateInvalidTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
        @admin = users(:three)
        @client = users(:two)

    @valid_params = {
      package: {
        title: "Bille invalide",
        description: "...",
        price: 189.99,
        quota: 500,
        category: "daily",
        valid_at: "2026-07-05T20:10:00Z",
        expired_at: "2026-07-05T20:00:00Z",
        festival: festivals(:one).id
      }
    }

    @invalid_params = {
      package: {
        title: nil 
      }
    }
    end

    test "should forbid creation if user is not admin" do
      sign_in @client

      # modif ou non
      assert_no_difference("Package.count") do
        post api_packages_url, params: @valid_params, as: :json
      end

      # code http
      assert_response :forbidden

      # format et donne reponse
      json = JSON.parse(response.body)
      assert_equal "error", json["status"]
      assert_equal 403, json["code"]
      assert_equal "Access denied: Admin privileges required.", json["message"]
    end


end