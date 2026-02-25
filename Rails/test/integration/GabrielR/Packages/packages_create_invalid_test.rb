require "test_helper"

class PackagesCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @festival = festivals(:one)
  end

  test "create is forbidden when unauthenticated" do
    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload, as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "index is forbidden when unauthenticated" do
    get api_packages_url
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "create is forbidden when authenticated user is not admin" do
    sign_in @client

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload, as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "index is forbidden when authenticated user is not admin" do
    sign_in @client

    get api_packages_url
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "create fails when title is missing" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(title: nil), as: :json
    end

    assert_validation_error
  end

  test "create fails when price is negative" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(price: -1), as: :json
    end

    assert_validation_error
  end

  test "create fails when category is invalid" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(category: "vip"), as: :json
    end

    assert_validation_error
  end

  test "create fails when expired_at is before valid_at" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url,
           params: valid_package_payload(valid_at: "2026-08-02 20:00:00", expired_at: "2026-08-02 10:00:00"),
           as: :json
    end

    assert_validation_error
  end

  test "create fails when quota exceeds festival daily capacity" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(quota: @festival.daily_capacity + 1), as: :json
    end

    assert_validation_error
  end

  test "create fails when valid_at is before festival start date" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(valid_at: "2026-07-31 23:59:59"), as: :json
    end

    assert_validation_error
  end

  test "create fails when expired_at is after festival end date" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(expired_at: "2026-08-04 00:00:00"), as: :json
    end

    assert_validation_error
  end

  test "create fails when festival_id is missing" do
    sign_in @admin

    assert_no_difference("Package.count") do
      post api_packages_url, params: valid_package_payload(festival_id: nil), as: :json
    end

    assert_validation_error
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end

  def assert_validation_error
    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Validation failed", json["message"]
    assert json["errors"].present?
  end

  def valid_package_payload(overrides = {})
    base = {
      title: "Create Invalid Target",
      description: "Payload valide de reference",
      price: 70.0,
      quota: 10,
      category: "daily",
      valid_at: "2026-08-02 10:00:00",
      expired_at: "2026-08-02 22:00:00",
      festival_id: @festival.id
    }

    { package: base.merge(overrides) }
  end
end
