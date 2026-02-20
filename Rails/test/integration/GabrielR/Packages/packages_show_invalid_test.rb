require "test_helper"

class PackagesShowInvalidTest < ActionDispatch::IntegrationTest
  
  test "should return 404 code when package is not found" do
    # modif ou non
    assert_no_difference("Package.count") do
      get api_package_url(id: 999999), as: :json
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
end