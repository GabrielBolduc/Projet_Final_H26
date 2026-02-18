require "test_helper"

class FestivalInvalidTest < ActionDispatch::IntegrationTest
    test "should return error with non-existent id" do
        # modif ou non
        assert_no_difference("Festival.count") do
            get api_festival_url(id: 999999), as: :json
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
        assert_equal 404, json["code"]
    end
end
