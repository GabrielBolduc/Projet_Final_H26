require "test_helper"

class ArtistsDestroyInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @artist = artists(:one)
    @artist_with_performances = artists(:three)
  end

  test "should return 404 when deleting non-existent artist" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      delete api_artist_url(id: 999999), as: :json
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
    assert_no_difference("Artist.count") do
      delete api_artist_url(@artist), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to delete if artist is linked to performances" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      delete api_artist_url(@artist_with_performances), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Impossible de supprimer cet artiste car il est lié à des performances.", json["message"]
    assert_not_nil json["errors"]
  end
end