require "test_helper"

class PackagesShowInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
  end

  test "show returns ongoing package when unauthenticated" do
    get api_package_url(packages(:one))
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal packages(:one).id, json.dig("data", "id")
    assert_equal "ongoing", json.dig("data", "festival", "status")
  end

  test "show returns ongoing package for non admin users" do
    sign_in @client

    get api_package_url(packages(:one))
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal packages(:one).id, json.dig("data", "id")
    assert_equal "ongoing", json.dig("data", "festival", "status")
  end

  test "show hides completed package when unauthenticated" do
    get api_package_url(packages(:five))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "show hides completed package for non admin users" do
    sign_in @client

    get api_package_url(packages(:five))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "show hides draft package for non admin users" do
    sign_in @client

    get api_package_url(packages(:six))
    assert_response :ok

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "show returns error for unknown numeric id" do
    sign_in @admin

    assert_no_difference("Package.count") do
      get api_package_url(id: 999_999)
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "show returns error for unknown string id" do
    sign_in @admin

    assert_no_difference("Package.count") do
      get api_package_url(id: "missing-package")
    end

    assert_response :ok
    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Package not found", json["message"]
  end

  test "show returns sold field even when sold is zero" do
    sign_in @admin
    package = packages(:seven)

    get api_package_url(package)
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal package.id, json.dig("data", "id")
    assert_equal 0, json.dig("data", "sold")
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end
