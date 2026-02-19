require "test_helper"

class PackagesInvalidTest < ActionDispatch::IntegrationTest
  setup do
    @package = packages(:one)
    @client = users(:one)
    @festival = festivals(:one)
  end

  test "should return error with non-existent id" do
    get api_package_url(id: 999999), as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
  end

  test "client cannot create package (403 Forbidden)" do
    sign_in @client
    assert_no_difference("Package.count") do
      post api_packages_url, params: {
        package: { title: "Hacker Pass", price: 10, festival_id: @festival.id }
      }, as: :json
    end
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
  end

  test "should fail create with invalid params (Validation)" do
    sign_in users(:three)
    assert_no_difference("Package.count") do
      post api_packages_url, params: {
        package: { title: "Bad Price", price: -10, festival_id: @festival.id }
      }, as: :json
    end
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
  end
end