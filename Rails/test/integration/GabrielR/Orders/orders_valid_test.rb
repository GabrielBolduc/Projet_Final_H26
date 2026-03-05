require "test_helper"

class OrdersValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one) # Client
    @client.update!(phone_number: "555-1234") if @client.phone_number.blank?
    @package = packages(:one) # Pass général
    @order = orders(:one) # Appartenant à users(:one)
  end

  test "client should list their orders" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      get api_orders_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
    assert json["data"].all? { |o| o["user_id"] == @client.id }
  end

  test "client should show one of their orders" do
    sign_in @client

    # modif ou non
    assert_no_difference("Order.count") do
      get api_order_url(@order), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @order.id, json["data"]["id"]
    assert_not_nil json["data"]["tickets"]
  end

  test "client should create a new order" do
    sign_in @client
    params = {
      order: {
        package_id: @package.id,
        quantity: 1,
        holder_name: "Jean Dupont",
        holder_email: "jean@dupont.com",
        holder_phone: "555-0101"
      }
    }

    # modif ou non
    assert_difference("Order.count", 1) do
      assert_difference("Ticket.count", 1) do
        post api_orders_url, params: params, as: :json
      end
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @client.id, json["data"]["user_id"]
    assert_equal "Jean Dupont", json["data"]["tickets"].first["holder_name"]
  end

  test "client should create an order with multiple holders" do
    sign_in @client
    params = {
      order: {
        package_id: @package.id,
        quantity: 2,
        tickets: [
          { holder_name: "A", holder_email: "a@test.com", holder_phone: "1" },
          { holder_name: "B", holder_email: "b@test.com", holder_phone: "2" }
        ]
      }
    }

    # modif ou non
    assert_difference("Order.count", 1) do
      assert_difference("Ticket.count", 2) do
        post api_orders_url, params: params, as: :json
      end
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal 2, json["data"]["tickets"].size
    assert_equal "A", json["data"]["tickets"].first["holder_name"]
    assert_equal "B", json["data"]["tickets"].second["holder_name"]
  end

  test "client should create order and default to their own info if holders are missing" do
    sign_in @client
    params = {
      order: {
        package_id: @package.id,
        quantity: 2,
        tickets: [
          { holder_name: "A", holder_email: "a@test.com", holder_phone: "1" }
        ]
      }
    }

    # modif ou non
    assert_difference("Order.count", 1) do
      assert_difference("Ticket.count", 2) do
        post api_orders_url, params: params, as: :json
      end
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "A", json["data"]["tickets"].first["holder_name"]
    assert_equal @client.name, json["data"]["tickets"].second["holder_name"]
  end
end
