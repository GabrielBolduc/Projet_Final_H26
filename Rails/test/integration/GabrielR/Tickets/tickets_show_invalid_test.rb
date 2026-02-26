require "test_helper"

class TicketsShowInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
    @admin = users(:three)
  end

  test "show is forbidden when unauthenticated" do
    get api_ticket_url(tickets(:one))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "show is forbidden for admin users" do
    sign_in @admin

    get api_ticket_url(tickets(:one))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "show returns error for unknown numeric id" do
    sign_in @client

    get api_ticket_url(id: 999_999)
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "show returns error for unknown string id" do
    sign_in @client

    get api_ticket_url(id: "missing-ticket")
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "show does not expose tickets belonging to another client" do
    other_client = users(:four)
    sign_in other_client

    get api_ticket_url(tickets(:one))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "index is forbidden when unauthenticated" do
    get api_tickets_url
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  test "index is forbidden for admin users" do
    sign_in @admin

    get api_tickets_url
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Client authentication required.", json["message"]
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end