require "test_helper"

class ArtistsCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)
    @existing_artist = artists(:one)

    @valid_params = {
      name: "Artiste Invalide",
      genre: "Pop",
      popularity: 3
    }
  end

  test "should forbid creation if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "should fail to create with nil name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(name: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["name"]
  end

  test "should fail to create with duplicate name" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(name: @existing_artist.name) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["name"]
  end

  test "should fail to create with name longer than 100 chars" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(name: "a" * 101) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["name"]
  end

  test "should fail to create with nil genre" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(genre: nil) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["genre"]
  end

  test "should fail to create with genre longer than 50 chars" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(genre: "a" * 51) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["genre"]
  end

  test "should fail to create with bio longer than 1600 chars" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(bio: "a" * 1601) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["bio"]
  end

  test "should fail to create with popularity whith more than 5" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(popularity: 6) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["popularity"]
  end

  test "should fail to create with negative popularity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(popularity: -1) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["popularity"]
  end

  test "should fail to create with decimal popularity" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(popularity: 3.5) }, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["popularity"]
  end

  test "should fail to create with invalid image format" do
    sign_in @admin
    invalid_file = fixture_file_upload(Rails.root.join("test", "fixtures", "files", "test.txt"), "text/plain")

    # modif ou non
    assert_no_difference("Artist.count") do
      post api_artists_url, params: { artist: @valid_params.merge(image: invalid_file) }
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_not_nil json["errors"]["image"]
  end
end
