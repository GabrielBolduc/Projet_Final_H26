require "test_helper"

class PackagesUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @package = packages(:one)
    @invalid_params = { package: { quota: -500 } } # Quota impossible
  end

  test "should return 404 code when updating non-existent package" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Package.count") do
      put api_package_url(id: 999999), params: { package: { title: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
  end

  test "should forbid update if user is not admin" do
    sign_in @client

    assert_no_difference("Package.count") do
      put api_package_url(@package), params: { package: { title: "Hack" } }, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal 403, json["code"]
  end

  test "should fail to update with invalid data" do
    sign_in @admin

    assert_no_difference("Package.count") do
      put api_package_url(@package), params: @invalid_params, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal 422, json["code"]
    assert_not_nil json["errors"]
  end
end