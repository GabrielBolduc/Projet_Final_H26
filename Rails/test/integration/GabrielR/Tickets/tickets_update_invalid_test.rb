require "test_helper"

class TicketsUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
    @admin = users(:three)
    @ticket = tickets(:one)
    @refunded_ticket = tickets(:three)
  end

  test "update is forbidden when unauthenticated" do
    old_name = @ticket.holder_name

    patch api_ticket_url(@ticket), params: { ticket: { holder_name: "Ghost" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
    assert_equal old_name, @ticket.reload.holder_name
  end

  test "update is forbidden for admin users" do
    sign_in @admin
    old_name = @ticket.holder_name

    patch api_ticket_url(@ticket), params: { ticket: { holder_name: "Admin Override" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
    assert_equal old_name, @ticket.reload.holder_name
  end

  test "update returns error for unknown ticket id" do
    sign_in @client

    patch api_ticket_url(id: 999_999), params: { ticket: { holder_name: "Ghost" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "update is blocked on a refunded ticket" do
    sign_in @client
    old_name = @refunded_ticket.holder_name

    patch api_ticket_url(@refunded_ticket), params: { ticket: { holder_name: "New Name" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Cannot update a refunded ticket", json["message"]
    assert_equal old_name, @refunded_ticket.reload.holder_name
  end

  test "update does not allow editing tickets belonging to another client" do
    other_client = users(:four)
    sign_in other_client
    old_name = @ticket.holder_name

    patch api_ticket_url(@ticket), params: { ticket: { holder_name: "Stolen Update" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
    assert_equal old_name, @ticket.reload.holder_name
  end

  test "update fails with invalid email format" do
    sign_in @client
    old_email = @ticket.holder_email

    patch api_ticket_url(@ticket), params: { ticket: { holder_email: "not-an-email" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert json["errors"].present?
    assert_equal old_email, @ticket.reload.holder_email
  end

  test "update fails with invalid phone format" do
    sign_in @client
    old_phone = @ticket.holder_phone

    patch api_ticket_url(@ticket), params: { ticket: { holder_phone: "not-a-phone!!!" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert json["errors"].present?
    assert_equal old_phone, @ticket.reload.holder_phone
  end

  test "update fails when holder_name is blank" do
    sign_in @client
    old_name = @ticket.holder_name

    patch api_ticket_url(@ticket), params: { ticket: { holder_name: "" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert json["errors"].present?
    assert_equal old_name, @ticket.reload.holder_name
  end

  test "update fails when holder_email is blank" do
    sign_in @client
    old_email = @ticket.holder_email

    patch api_ticket_url(@ticket), params: { ticket: { holder_email: "" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert json["errors"].present?
    assert_equal old_email, @ticket.reload.holder_email
  end

  test "update errors response includes specific field keys" do
    sign_in @client

    patch api_ticket_url(@ticket), params: { ticket: { holder_email: "bad-email" } }, as: :json
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert json.dig("errors", "holder_email").present?
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end