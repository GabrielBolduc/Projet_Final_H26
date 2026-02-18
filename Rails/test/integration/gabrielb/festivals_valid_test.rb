require "test_helper"

class FestivalValidTest < ActionDispatch::IntegrationTest
    setup do
        @festival = festivals(:one)
    end

    test "should get index with succes" do
        # modif ou non
        assert_no_difference("Festival.count") do
            get api_festivals_url(page: 1, perpage: 10), as: :json
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "success", json["status"]
        assert_kind_of Array, json["data"]
    end

    test "should show festival with valid id" do
        # modif ou non
        assert_no_difference("Festival.count") do
            get api_festival_url(@festival), as: :json
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "success", json["status"]
        assert_equal @festival.id, json["data"]["id"]
        assert_equal @festival.name, json["data"]["name"]
    end
end
