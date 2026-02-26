require "test_helper"

class TicketsDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
    @admin = users(:three)
    @ticket = tickets(:one)
    @refunded_ticket = tickets(:three)
  end

  test "refund is forbidden when unauthenticated" do
    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@ticket), as: :json
    end

    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
    assert_not @ticket.reload.refunded?
  end

  test "refund is forbidden for admin users" do
    sign_in @admin

    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@ticket), as: :json
    end

    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
    assert_not @ticket.reload.refunded?
  end

  test "refund returns error for unknown ticket id" do
    sign_in @client

    delete api_ticket_url(id: 999_999), as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "refund fails when ticket is already refunded" do
    sign_in @client

    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@refunded_ticket), as: :json
    end

    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Ticket already refunded", json["message"]
  end

  test "refund does not allow refunding a ticket belonging to another client" do
    other_client = users(:four)
    sign_in other_client

    assert_no_difference("Ticket.count") do
      delete api_ticket_url(@ticket), as: :json
    end

    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
    assert_not @ticket.reload.refunded?
  end

  test "refund error does not modify refunded_at on already refunded ticket" do
    sign_in @client
    original_refunded_at = @refunded_ticket.refunded_at

    delete api_ticket_url(@refunded_ticket), as: :json
    assert_response :ok

    assert_equal original_refunded_at.to_i, @refunded_ticket.reload.refunded_at.to_i
  end

  test "failed refund attempt by another client does not modify the ticket" do
    other_client = users(:four)
    sign_in other_client
    original_name = @ticket.holder_name

    delete api_ticket_url(@ticket), as: :json
    assert_response :ok

    @ticket.reload
    assert_not @ticket.refunded?
    assert_nil @ticket.refunded_at
    assert_equal original_name, @ticket.holder_name
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end