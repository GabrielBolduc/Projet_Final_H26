require "test_helper"

class PackagesValidTest < ActionDispatch::IntegrationTest
  setup do
    @package = packages(:one)
    @admin = users(:three)
    @festival = festivals(:one)
  end

  test "should get index with success" do
    assert_no_difference("Package.count") do
      get api_packages_url, as: :json
    end
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_kind_of Array, json["data"]
  end

  test "should show package with valid id" do
    get api_package_url(@package), as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @package.id, json["data"]["id"]
  end

  test "admin should create package successfully" do
    sign_in @admin
    assert_difference("Package.count", 1) do
      post api_packages_url, params: {
        package: {
          title: "New Pass",
          price: 100,
          quota: 50,
          category: "general",
          valid_at: Date.tomorrow,
          expired_at: Date.tomorrow + 1.day,
          festival_id: @festival.id
        }
      }, as: :json
    end
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end

  test "admin should update package successfully" do
    sign_in @admin
    patch api_package_url(@package), params: { package: { title: "Updated Title" } }, as: :json
    assert_response :success
    @package.reload
    assert_equal "Updated Title", @package.title
  end

  test "admin should destroy package successfully" do
    sign_in @admin
    
    package_to_delete = Package.create!(
      title: "Package à supprimer",
      price: 50.0,
      quota: 100,
      category: "general",
      valid_at: Date.tomorrow,
      expired_at: Date.tomorrow + 1.day,
      festival: @festival
    )

    assert_difference("Package.count", -1) do
      delete api_package_url(package_to_delete), as: :json
    end

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end
end