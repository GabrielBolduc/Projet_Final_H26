require "test_helper"

class PerformancesCreateInvalidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:two)

    @valid_params = {
      performance: {
        title: "Show valid",
        price: 59.99,
        start_at: "2026-08-02T20:00:00Z",
        end_at: "2026-08-02T22:00:00Z",
        artist_id: artists(:one).id,
        stage_id: stages(:one).id,
        festival_id: festivals(:one).id
      }
    }

    @invalid_params = {
      performance: {
        title: nil 
      }
    }
  end

  test "should forbid creation if user is not admin" do
    sign_in @client

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: @valid_params, as: :json
    end

    # code http
    assert_response :forbidden

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 403, json["code"]
    assert_equal "Access denied: Admin privileges required.", json["message"]
  end

  test "should fail to create with invalid data" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Performance.count") do
      post api_performances_url, params: @invalid_params, as: :json
    end

    # code http
    assert_response :unprocessable_entity

    # format et donne reponse
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_equal 422, json["code"]
    assert_equal "Validation failed", json["message"]
    assert_not_nil json["errors"]
  end
end