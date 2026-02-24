require "test_helper"

class AffectationsTest < ActionDispatch::IntegrationTest
  setup do
    @user_one = users(:three)

    @festival = festivals(:one)

    @task_one = tasks(:one)
    @task_tow = tasks(:two)

    @affectation_one = affectations(:one)
    @affectation_tow = affectations(:two)
    @affectation_three = affectations(:three)
    @affectation_four = affectations(:four)
    @affectation_five = affectations(:five)
    
   
  end

  test "should show one affectation and return JSON" do
    sign_in users(:one)
    # base de donnees
    assert_no_difference("Affectation.count") do
      get api_affectation_path(@affectation_three)
      
    end

    # code http
    assert_response :success

    # format de reponse
    assert_nothing_raised { JSON.parse(response.body) }
    json_response = JSON.parse(response.body)

     # contenu de reponse
    assert_equal @affectation_three.id, json_response["data"]["id"]
    assert_equal @affectation_three.start, json_response["data"]["start"]
    assert_equal @affectation_three.end, json_response["data"]["end"]
    assert_equal @affectation_three.expected_start, json_response["data"]["expected_start"]
    assert_equal @affectation_three.expected_end, json_response["data"]["expected_end"]
    assert_equal @affectation_three.responsability, json_response["data"]["responsability"]
    
  end
 
    test "should get tasks affectation and return JSON" do
        sign_in users(:three)
        # la base de donnée n'a pas changer
        assert_no_difference("Affectation.count") do
        get get_by_user_api_affectations_path(user_id: @user_one.id)
        end

        # code http
        assert_response :success

        # format de reponse en JSON
        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)

        # format de donné aproprié
        assert json_response.is_a?(Hash)
        assert_equal "success", json_response["status"]
        assert json_response["data"].is_a?(Array), "data should be an array"
    end

    test "should get user affectations and return JSON" do
        sign_in users(:three)

        assert_no_difference("Affectation.count") do
        get get_by_task_api_affectations_path(task_id: @task_one.id)
        end


        assert_response :success

        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)


        assert json_response.is_a?(Hash)
        assert_equal "success", json_response["status"]
        assert json_response["data"].is_a?(Array), "data should be an array"
    end

     test "can create anime" do
        sign_in users(:one)

        # base de donnees
        assert_difference "Affectation.count", 1 do
            post api_affectations_path, params: { affectation: valid_create_affectation_params }
            #puts response.body
        end

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)

        # code http
        assert_response :success

        # contenu de reponse
        assert_equal true, json_response["success"], "Success flag should be true"
    end

    test "can update affectation" do
        sign_in users(:one)

        # base de donnees
        assert_no_difference "Affectation.count" do
            patch  api_affectation_path(@affectation_one), params: { affectation: valid_edit_affectation_params }
          # puts response.body
        end

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)

        # code http
        assert_response :success

        # contenu de reponse
        assert_equal true, json_response["success"], "Success flag should be true"
    end

    test " can delete affectation" do
        sign_in users(:one)

        # base de donnees
        assert_difference "Affectation.count", -1 do
            delete api_affectation_path(@affectation_five)
        end

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }

        # code http
        assert_response :success
        json_response = JSON.parse(response.body)

        # contenu de reponse
        assert_equal true, json_response["success"], "Affectation should be deleted"
    end

    private

    def valid_create_affectation_params
        {
            user_id: @user_one.id,
            task_id: @task_one.id,
            festival_id: @festival.id,
            expected_start: Time.now,
            expected_end: Time.now + 1.hour,
            responsability: "Responsability"
        }
    end

    def valid_edit_affectation_params
        {
            user_id: @user_one.id,
            task_id: @task_tow.id,
            festival_id: @festival.id,
            start: Time.now,
            end: Time.now + 1.hour,
            expected_start: Time.now + 1.day,
            expected_end: Time.now + 2.days,
            responsability: "Responsability Updated"
        }
    end

end