require "test_helper"

class FestivalsValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @ongoing_festival = festivals(:one) 
    
    @valid_params = {
      festival: {
        name: "Nouveau Festival",
        start_at: "2027-07-01",
        end_at: "2027-07-05",
        status: "draft",
        address: "123 Rue Principale",
        daily_capacity: 5000,
        satisfaction: 5,
        latitude: 45.4042,
        longitude: -71.8929
      }
    }
  end

  test "public should list only ongoing festivals" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get api_festivals_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "admin should list all festivals" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get api_festivals_url, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "should return current ongoing festival" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get current_api_festivals_url, as: :json 
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @ongoing_festival.id, json["data"]["id"]
  end

  test "should show a specific ongoing festival" do
    # modif ou non
    assert_no_difference("Festival.count") do
      get api_festival_url(@ongoing_festival), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal @ongoing_festival.name, json["data"]["name"]
  end

  test "admin should create a new draft festival" do
    sign_in @admin

    # modif ou non
    assert_difference("Festival.count", 1) do
      post api_festivals_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Nouveau Festival", json["data"]["name"]
  end

  test "admin should update a festival" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@ongoing_festival), params: { festival: { name: "Nom Modifié" } }, as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Nom Modifié", json["data"]["name"]
  end

  test "admin should delete a draft festival" do
    sign_in @admin
    draft_festival = festivals(:three)

    # modif ou non
    assert_difference("Festival.count", -1) do
      delete api_festival_url(draft_festival), as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_equal "Festival supprimé avec succès.", json["message"]
    assert_nil json["data"]
  end

  test "should succeed to create a completed festival in the past" do
    sign_in @admin

    archive_params = {
      festival: {
        name: "Festival Archive 2025",
        start_at: 1.year.ago.to_date.to_s,
        end_at: (1.year.ago + 4.days).to_date.to_s,
        status: "completed",
        address: "123 Rue de l'Archive",
        daily_capacity: 5000,
        latitude: 45.4042,
        longitude: -71.8929
      }
    }

    # modif ou non
    assert_difference("Festival.count", 1) do
      post api_festivals_url, params: archive_params, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end

  test "should succeed to update a festival to the past with completed status" do
    sign_in @admin

    archive_params = {
      festival: {
        status: "completed",
        start_at: 1.year.ago.to_date.to_s,
        end_at: (1.year.ago + 4.days).to_date.to_s,
        name: "Festival Archive Mis à jour"
      }
    }

    # modif ou non
    assert_no_difference("Festival.count") do
      put api_festival_url(@ongoing_festival), params: archive_params, as: :json
    end

    # code http
    assert_response :ok

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end
end