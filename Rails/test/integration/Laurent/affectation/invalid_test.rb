require "test_helper"

class TasksTest < ActionDispatch::IntegrationTest
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


    test "should not show one affectation  and return user not connect" do
        # base de donnees
        assert_no_difference("Affectation.count") do
        get api_affectation_path(@affectation_one)
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "should not show one Affectation  and return not found " do
    sign_in users(:one)
    # base de donnees
    assert_no_difference("Affectation.count") do
      get api_affectation_path(7)
    end

    # code http
    assert_response :not_found

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "not_found", json["error"]
    end

    test "should not get  affectations list by user but and return JSON" do
        # la base de donnée n'a pas changer
        assert_no_difference("Affectation.count") do
        get get_by_user_api_affectations_path(user_id: @user_one.id)
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "should not get  affectations list by task but and return JSON" do
        # la base de donnée n'a pas changer
       assert_no_difference("Affectation.count") do
        get get_by_task_api_affectations_path(task_id: @task_one.id)
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    
    test "can not update affectation user logout" do
        # base de donnees
        assert_no_difference "Affectation.count" do
            patch  api_affectation_path(@affectation_one), params: { affectation: valid_edit_affectation_params }
          # puts response.body
        end
        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "can not update affectation params invalide" do
      sign_in users(:one)
        # base de donnees
        assert_no_difference "Affectation.count" do
            patch  api_affectation_path(@affectation_one), params: { affectation: invalid_edit_affectation_params }
          # puts response.body
        end
        # code http
        assert_response :unprocessable_entity

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)

        # contenu de reponse
        assert_equal false, json_response["success"], "Creation should fail for invalid param"
        assert json_response["errors"].any?, "Errors should be present for invalid param"
    end

    
    test "delete non-existent Affectation" do
        sign_in users(:one)

        # base de donnees
        assert_no_difference "Affectation.count" do
          delete api_affectation_path(-1)
        end

        # code http
        assert_response :not_found

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "not_found", json["error"]
    end

    test "should not destroy one affectation  and return 401 user not connect" do
      # base de donnees
      assert_no_difference "Affectation.count" do
            delete api_affectation_path(@affectation_three)
        end

      # code http
      assert_response :success

      # format reponse
      json = JSON.parse(response.body)

      # donne reponse
      assert_equal "error", json["status"]
    end

       test "cannot create a affectation without type params " do
      sign_in users(:one)
        # base de donnees
        assert_no_difference "Affectation.count", "Affectation should not be created with invalid param" do
             post api_affectations_path, params: { affectation: invalid_create_affectation_params }
        end

        # code http
        assert_response :unprocessable_entity

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }
        json_response = JSON.parse(response.body)

        # contenu de reponse
        assert_equal false, json_response["success"], "Creation should fail for invalid param"
        assert json_response["errors"].any?, "Errors should be present for invalid param"
    end

    test "can not create affectation while log out" do
        # base de donnees
        assert_no_difference "Affectation.count" do
            post api_affectations_path, params: { affectation: valid_create_affectation_params }
          # puts response.body
        end
            # code http
            assert_response :success

            # format reponse
            json = JSON.parse(response.body)

            # donne reponse
            assert_equal "error", json["status"]
    end

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

     def invalid_create_affectation_params
        {
            user_id: nil,
            task_id: nil,
            festival_id: nil,
            expected_start:nil,
            expected_end: nil,
            responsability: ""
        }
    end

    def invalid_edit_affectation_params
        {
             user_id: nil,
            task_id: nil,
            start: nil,
            end: nil,
            festival_id: nil,
            expected_start:nil,
            expected_end: nil,
            responsability: ""
        }
    end
end