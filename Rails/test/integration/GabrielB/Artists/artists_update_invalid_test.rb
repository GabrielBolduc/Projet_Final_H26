require "test_helper"

class ArtistsUpdateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @artist = artists(:one)
    @other_artist = artists(:two)
  end

  test "should return 404 when updating non-existent artist" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      put api_artist_url(id: 999999), params: { artist: { name: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should forbid update if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Artist.count") do
      put api_artist_url(@artist), params: { artist: { name: "Test" } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to update with nil name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      put api_artist_url(@artist), params: { artist: { name: nil } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["name"]
  end

  test "should fail to update with already taken name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      put api_artist_url(@artist), params: { artist: { name: @other_artist.name } }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["name"]
  end
end
