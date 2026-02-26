require "test_helper"

class FestivalsShowInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @draft_festival = festivals(:two)
  end

  # faux id
  test "should return 404 when festival is not found" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get api_festival_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  # festival non public
  test "should forbid show if festival is not ongoing and user is not admin" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get api_festival_url(@draft_festival), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "festival non public", json["message"]
  end
end