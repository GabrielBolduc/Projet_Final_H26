require "test_helper"

class FestivalsDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @ongoing_festival = festivals(:one)
  end

  test "should return 404 when deleting non-existent festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      delete api_festival_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should forbid deletion if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Festival.count") do
      delete api_festival_url(@ongoing_festival), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to delete if festival is ongoing" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      delete api_festival_url(@ongoing_festival), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Impossible de supprimer ce festival.", json["message"]
    assert_not_nil json["errors"]
  end
end