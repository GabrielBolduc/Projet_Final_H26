require "test_helper"

class ArtistsShowInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @isolated_artist = artists(:four)
  end

  test "should return 404 when artist is not found" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artist_url(id: 999999), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Resource not found", json["message"]
  end

  test "should return error when public tries to show artist without performances" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artist_url(@isolated_artist), as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal "Cet artiste n'est pas encore programmé.", json["message"]
  end
end
