require "test_helper"

class PackagesDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @package_with_tickets = packages(:one)
    @package_with_only_refunded_ticket = packages(:five)
    @deletable_package = packages(:seven)
  end

  test "destroy returns error when package does not exist" do
    sign_in @admin

    assert_no_difference("Package.count") do
      delete api_package_url(id: 999_999), as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "destroy is forbidden for non admin users" do
    sign_in @client

    assert_no_difference("Package.count") do
      delete api_package_url(@deletable_package), as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "destroy fails when package has active or refunded tickets" do
    sign_in @admin

    assert_no_difference("Package.count") do
      delete api_package_url(@package_with_tickets), as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Cannot delete package", json["message"]
    assert json["errors"].present?
    assert Package.exists?(@package_with_tickets.id)
  end

  test "destroy also fails when package has only refunded tickets" do
    sign_in @admin

    assert_equal true, @package_with_only_refunded_ticket.tickets.all?(&:refunded?)

    assert_no_difference("Package.count") do
      delete api_package_url(@package_with_only_refunded_ticket), as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Cannot delete package", json["message"]
    assert json["errors"].present?
    assert Package.exists?(@package_with_only_refunded_ticket.id)
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end
