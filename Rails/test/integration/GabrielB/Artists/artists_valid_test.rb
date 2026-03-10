require "test_helper"

class ArtistsValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @artist = artists(:one)

    @valid_params = {
      artist: {
        name: "Nouvel Artiste",
        genre: "Rock",
        bio: "Une biographie fascinante.",
        popularity: 4
      }
    }
  end

  test "public should list all artists" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artists_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "public should search artists by name" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artists_url(search: @artist.name), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert json["data"].any? { |a| a["name"].include?(@artist.name) }
  end

  test "public should filter artists by genre" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artists_url(genre: @artist.genre), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert json["data"].all? { |a| a["genre"].include?(@artist.genre) }
  end

  test "public should show a specific artist" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artist_url(@artist), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @artist.name, json["data"]["name"]
    assert_includes json["data"].keys, "image_url"
  end

  test "admin should create a new artist" do
    sign_in @admin

    # modif ou non
    assert_difference("Artist.count", 1) do
      post api_artists_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Nouvel Artiste", json["data"]["name"]
  end

  test "admin should create artist and strip whitespaces" do
    sign_in @admin
    params_with_spaces = @valid_params.deep_dup
    params_with_spaces[:artist][:name] = "   Céline Dion   "
    params_with_spaces[:artist][:genre] = "  Pop  "

    # modif ou non
    assert_difference("Artist.count", 1) do
      post api_artists_url, params: params_with_spaces, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Céline Dion", json["data"]["name"]
    assert_equal "Pop", json["data"]["genre"]
  end

  test "admin should update an artist" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Artist.count") do
      put api_artist_url(@artist), params: { artist: { name: "Nom Modifié" } }, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Nom Modifié", json["data"]["name"]
  end

  test "admin should delete an artist without performances" do
    sign_in @admin
    isolated_artist = artists(:two)

    # modif ou non
    assert_difference("Artist.count", -1) do
      delete api_artist_url(isolated_artist), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Artiste supprimé avec succès.", json["message"]
    assert_nil json["data"]
  end

  test "public should fetch used genres" do
    # modif ou non
    assert_no_difference("Artist.count") do
      get genres_api_artists_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
    assert json["data"].is_a?(Array)
  end

  test "admin should show an artist without performances" do
    sign_in @admin
    isolated_artist = artists(:four)

    # modif ou non
    assert_no_difference("Artist.count") do
      get api_artist_url(isolated_artist), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal isolated_artist.name, json["data"]["name"]
  end
end
