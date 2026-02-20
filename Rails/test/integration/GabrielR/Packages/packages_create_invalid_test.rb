require "test_helper"

class PackagesCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)

    @valid_params = {
      package: {
        title: "Billet Test", price: 50.00, quota: 100, category: "daily",
        festival_id: festivals(:one).id
      }
    }

    @invalid_params = { package: { title: nil, price: -10 } }
  end

  test "should forbid creation if user is not authenticated" do
    # modif ou non
    assert_no_difference("Package.count") do
      post api_packages_url, params: @valid_params, as: :json
    end
    
    # code http
    assert_response :ok 

    # format reponse
    json = JSON.parse(response.body)
    
    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "should forbid creation if user is not admin (Client)" do
    sign_in @client

    assert_no_difference("Package.count") do
      post api_packages_url, params: @valid_params, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "should fail to create with invalid data (missing title, negative price)" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: @invalid_params, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_equal "Validation failed", json["message"]
    assert_not_nil json["errors"]
  end
end