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

    # discount présence
    order_data = json["data"].find { |o| o["id"] == @order.id }
    assert_not_nil order_data["subtotal"]
    assert_not_nil order_data["discount"]
    assert_not_nil order_data["total_price"]

    expected_subtotal = @order.tickets.where(refunded_at: nil).sum(:price).to_f
    assert_equal expected_subtotal, order_data["subtotal"].to_f
    assert_equal (expected_subtotal - @order.discount.to_f), order_data["total_price"].to_f
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

    # discount exactitude
    expected_subtotal = @order.tickets.where(refunded_at: nil).sum(:price).to_f
    assert_equal expected_subtotal, json["data"]["subtotal"].to_f
    assert_equal @order.discount.to_f, json["data"]["discount"].to_f
    assert_equal (expected_subtotal - @order.discount.to_f), json["data"]["total_price"].to_f
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

    # Vérifier discount en réponse
    assert_equal @package.price.to_f, json["data"]["subtotal"].to_f
    assert_equal 0.0, json["data"]["discount"].to_f
    assert_equal @package.price.to_f, json["data"]["total_price"].to_f
  end

  test "client should create an order with discount" do
    sign_in @client
    # 10 % de réduction pour 2 ou +
    @package.update_columns(discount_min_quantity: 2, discount_rate: 0.1)

    params = {
      order: {
        package_id: @package.id,
        quantity: 2
      }
    }

    assert_difference("Order.count", 1) do
      post api_orders_url, params: params, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)

    expected_subtotal = (@package.price * 2).to_f
    expected_discount = (expected_subtotal * 0.1).round(2)
    expected_total = expected_subtotal - expected_discount

    assert_equal expected_subtotal, json["data"]["subtotal"].to_f
    assert_equal expected_discount, json["data"]["discount"].to_f
    assert_equal expected_total, json["data"]["total_price"].to_f

    # Vérifier sa présence dans la BD
    assert_equal expected_discount, Order.last.discount
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
