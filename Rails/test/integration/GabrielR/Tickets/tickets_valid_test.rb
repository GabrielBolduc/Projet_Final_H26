require "test_helper"

class TicketsValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
    @ticket = tickets(:one)
    @refunded_ticket = tickets(:three)
    sign_in @client
  end

  # INDEX
  test "index returns all tickets for the current client" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]

    returned_ids = json["data"].map { |t| t["id"] }
    expected_ids = [ tickets(:one), tickets(:two), tickets(:three), tickets(:four) ].map(&:id)
    assert_equal expected_ids.sort, returned_ids.sort
  end

  test "index includes package info on each ticket" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    json["data"].each do |ticket|
      assert ticket["package"].present?
      assert ticket.dig("package", "title").present?
    end
  end

  test "index returns tickets ordered by created_at desc" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    dates = json["data"].map { |t| t["purchased_at"] }
    assert_equal dates, dates.sort.reverse
  end

  test "index returns both active and refunded tickets" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    refunded_flags = json["data"].map { |t| t["refunded"] }
    assert_includes refunded_flags, true
    assert_includes refunded_flags, false
  end

  test "index does not return tickets belonging to another client" do
    other_client = users(:four)
    sign_out @client
    sign_in other_client

    get api_tickets_url
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal [], json["data"]
  end

  test "index returns expected fields on each ticket" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    ticket = json["data"].first
    %w[id order_id unique_code qr_code_url refunded refunded_at price
       purchased_at holder_name holder_email holder_phone package].each do |field|
      assert ticket.key?(field), "Expected field '#{field}' to be present"
    end
  end

  # SHOW
  test "show returns ticket details" do
    get api_ticket_url(@ticket)
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal @ticket.id, json.dig("data", "id")
    assert_equal @ticket.unique_code, json.dig("data", "unique_code")
    assert_equal @ticket.holder_name, json.dig("data", "holder_name")
    assert_equal @ticket.holder_email, json.dig("data", "holder_email")
    assert_equal @ticket.holder_phone, json.dig("data", "holder_phone")
    assert_equal @ticket.price.to_f, json.dig("data", "price").to_f
    assert_equal false, json.dig("data", "refunded")
  end

  test "show includes package info" do
    get api_ticket_url(@ticket)
    assert_response :ok

    json = parsed_body
    assert json.dig("data", "package").present?
    assert_equal @ticket.package.id, json.dig("data", "package", "id")
    assert_equal @ticket.package.title, json.dig("data", "package", "title")
  end

  test "show includes qr_code_url field" do
    get api_ticket_url(@ticket)
    assert_response :ok

    json = parsed_body
    assert json.dig("data").key?("qr_code_url")
  end

  test "show returns refunded ticket with refunded true and refunded_at set" do
    get api_ticket_url(@refunded_ticket)
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal true, json.dig("data", "refunded")
    assert json.dig("data", "refunded_at").present?
  end

  test "show returns ticket linked to a completed festival" do
    get api_ticket_url(tickets(:four))
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal tickets(:four).id, json.dig("data", "id")
    assert_equal packages(:five).id, json.dig("data", "package", "id")
  end

  test "show returns correct order_id on ticket" do
    get api_ticket_url(@ticket)
    assert_response :ok

    json = parsed_body
    assert_equal @ticket.order_id, json.dig("data", "order_id")
  end

  # UPDATE
  test "client can update holder info on active ticket" do
    patch api_ticket_url(@ticket),
          params: { ticket: { holder_name: "Updated Name", holder_email: "new@example.com", holder_phone: "5145550001" } },
          as: :json

    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal "Updated Name", json.dig("data", "holder_name")
    assert_equal "new@example.com", json.dig("data", "holder_email")
    assert_equal "5145550001", json.dig("data", "holder_phone")
    assert_equal "Updated Name", @ticket.reload.holder_name
  end

  test "update returns the full ticket payload after update" do
    patch api_ticket_url(@ticket),
          params: { ticket: { holder_name: "Payload Check" } },
          as: :json

    assert_response :ok

    json = parsed_body
    assert json.dig("data", "package").present?
    assert json.dig("data", "unique_code").present?
    assert_equal @ticket.id, json.dig("data", "id")
  end

  test "update only changes specified fields leaving others intact" do
    original_email = @ticket.holder_email
    original_phone = @ticket.holder_phone

    patch api_ticket_url(@ticket),
          params: { ticket: { holder_name: "Only Name Changed" } },
          as: :json

    assert_response :ok

    @ticket.reload
    assert_equal "Only Name Changed", @ticket.holder_name
    assert_equal original_email, @ticket.holder_email
    assert_equal original_phone, @ticket.holder_phone
  end

  test "update does not change refunded status or price" do
    original_price = @ticket.price

    patch api_ticket_url(@ticket),
          params: { ticket: { holder_name: "Safe Update" } },
          as: :json

    assert_response :ok

    @ticket.reload
    assert_equal false, @ticket.refunded
    assert_equal original_price, @ticket.price
  end

  # DESTROY (refund)
  test "client can refund an active ticket" do
    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@ticket), as: :json
    end

    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal true, json.dig("data", "refunded")
    assert json.dig("data", "refunded_at").present?
    assert @ticket.reload.refunded?
  end

  test "refund returns the full ticket payload" do
    delete api_ticket_url(@ticket), as: :json

    assert_response :ok

    json = parsed_body
    assert_equal @ticket.id, json.dig("data", "id")
    assert json.dig("data", "package").present?
    assert json.dig("data", "unique_code").present?
  end

  test "refunded_at is set to approximately now after refund" do
    freeze_time = Time.current

    delete api_ticket_url(@ticket), as: :json

    assert_response :ok

    @ticket.reload
    assert @ticket.refunded_at >= freeze_time - 5.seconds
    assert @ticket.refunded_at <= freeze_time + 5.seconds
  end

  test "refund does not delete the ticket from the database" do
    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@ticket), as: :json
    end

    assert Ticket.exists?(@ticket.id)
  end

  test "refunded ticket is still visible via show" do
    get api_ticket_url(@refunded_ticket)
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal true, json.dig("data", "refunded")
    assert_equal @refunded_ticket.id, json.dig("data", "id")
  end

  test "refunded ticket appears in index" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    ids = json["data"].map { |t| t["id"] }
    assert_includes ids, @refunded_ticket.id
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end