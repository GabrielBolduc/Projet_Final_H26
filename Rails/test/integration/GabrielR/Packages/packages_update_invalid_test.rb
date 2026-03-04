require "test_helper"

class PackagesUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @package = packages(:two)
    @festival = festivals(:one)
  end

  test "update returns error when package does not exist" do
    sign_in @admin

    assert_no_difference("Package.count") do
      put api_package_url(id: 999_999), params: { package: { title: "Ghost" } }, as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "update is forbidden for non admin users" do
    sign_in @client
    old_title = @package.title

    assert_no_difference("Package.count") do
      put api_package_url(@package), params: { package: { title: "Unauthorized Update" } }, as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
    assert_equal old_title, @package.reload.title
  end

  test "update fails with negative quota" do
    sign_in @admin
    old_quota = @package.quota

    put api_package_url(@package), params: { package: { quota: -10 } }, as: :json

    assert_validation_error
    assert_equal old_quota, @package.reload.quota
  end

  test "update fails with invalid category value" do
    sign_in @admin
    old_category = @package.category

    put api_package_url(@package), params: { package: { category: "vip" } }, as: :json

    assert_validation_error
    assert_equal old_category, @package.reload.category
  end

  test "update fails when expired_at is before valid_at" do
    sign_in @admin
    old_expired_at = @package.expired_at

    put api_package_url(@package),
        params: { package: { valid_at: "2026-08-02 20:00:00", expired_at: "2026-08-02 10:00:00" } },
        as: :json

    assert_validation_error
    assert_equal old_expired_at.to_i, @package.reload.expired_at.to_i
  end

  test "update fails when valid_at is outside festival dates" do
    sign_in @admin
    old_valid_at = @package.valid_at

    put api_package_url(@package),
        params: { package: { valid_at: "2026-07-31 23:59:59" } },
        as: :json

    assert_validation_error
    assert_equal old_valid_at.to_i, @package.reload.valid_at.to_i
  end

  test "update fails when expired_at is outside festival dates" do
    sign_in @admin
    old_expired_at = @package.expired_at

    put api_package_url(@package),
        params: { package: { expired_at: "2026-08-04 00:00:00" } },
        as: :json

    assert_validation_error
    assert_equal old_expired_at.to_i, @package.reload.expired_at.to_i
  end

  test "update fails when quota exceeds festival daily capacity" do
    sign_in @admin
    old_quota = @package.quota

    put api_package_url(@package),
        params: { package: { quota: @festival.daily_capacity + 1 } },
        as: :json

    assert_validation_error
    assert_equal old_quota, @package.reload.quota
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
end
