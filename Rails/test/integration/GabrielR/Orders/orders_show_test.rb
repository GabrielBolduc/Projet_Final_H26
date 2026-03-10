require "test_helper"

class OrdersShowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @other_client = users(:four)
    @order = orders(:one) # Appartient à users(:one)
  end

  test "should return 404 when order does not exist" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      get api_order_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should return 404 when client tries to show another user's order" do
    sign_in @other_client

    # modif ou non
    assert_no_difference("Order.count") do
      get api_order_url(@order), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should forbid show if user is admin" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Order.count") do
      get api_order_url(@order), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "should forbid show if user is not logged in" do
    # modif ou non
    assert_no_difference("Order.count") do
      get api_order_url(@order), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end
end
