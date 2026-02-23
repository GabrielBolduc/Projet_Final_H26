require "test_helper"

class PackagesDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @package = packages(:one)
  end

  test "should return 404 code when deleting non-existent package" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Package.count") do
      delete api_package_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "error", json["status"]
    assert_equal 404, json["code"]
    assert_equal "Package not found", json["message"]
  end

  test "should forbid deletion if user is not admin" do
    sign_in @client

    assert_no_difference("Package.count") do
      delete api_package_url(@package), as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
  end
end