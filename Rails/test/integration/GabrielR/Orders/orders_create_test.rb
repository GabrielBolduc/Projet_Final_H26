require "test_helper"

class OrdersCreateTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three) # Admin
    @staff = users(:two) # Staff
    @client = users(:one) # Client
    @package = packages(:one)

    @valid_params = {
      order: {
        package_id: @package.id,
        quantity: 1
      }
    }
  end

  test "should forbid creation if user is admin" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Order.count") do
      post api_orders_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "should forbid creation if user is staff" do
    sign_in @staff

    # modif ou non
    assert_no_difference("Order.count") do
      post api_orders_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "should fail to create with non-existent package" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      post api_orders_url, params: { order: { package_id: 999999, quantity: 1 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "should fail to create with zero quantity" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      post api_orders_url, params: { order: { package_id: @package.id, quantity: 0 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Quantity must be greater than 0", json["message"]
  end

  test "should fail to create with negative quantity" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      post api_orders_url, params: { order: { package_id: @package.id, quantity: -5 } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Quantity must be greater than 0", json["message"]
  end
end
