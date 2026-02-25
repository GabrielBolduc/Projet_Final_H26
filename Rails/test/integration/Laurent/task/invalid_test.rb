 require "test_helper"

class TasksTest < ActionDispatch::IntegrationTest
  setup do
    @user_one = users(:one)

    @task_one = tasks(:one)
    @task_tow = tasks(:two)
    @task_three = tasks(:three)
    @task_four = tasks(:four)
    @task_five = tasks(:five)
  end

    test "should not show one task  and return user not connect" do
        # base de donnees
        assert_no_difference("Task.count") do
        get api_task_path(@task_one)
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "should not show one task  and return not found " do
    sign_in users(:one)
    # base de donnees
    assert_no_difference("Task.count") do
      get api_task_path(7)
    end

    # code http
    assert_response :not_found

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "not_found", json["error"]
    end

    
    test "should not get tasks list but and return JSON" do
        # la base de donnée n'a pas changer
        assert_no_difference("Task.count") do
        get api_tasks_path
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "should not get reusables tasks list but and return JSON" do
        # la base de donnée n'a pas changer
        assert_no_difference("Task.count") do
        get get_reusable_api_tasks_path
        end

        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    
    test "can not update task user logout" do
        # base de donnees
        assert_no_difference "Task.count" do
            patch  api_task_path(@task_one), params: { task: valid_task_params }
          # puts response.body
        end
        # code http
        assert_response :success

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "error", json["status"]
    end

    test "can not update task params invalide" do
      sign_in users(:one)
        # base de donnees
        assert_no_difference "Task.count" do
            patch  api_task_path(@task_one), params: { task: invalid_task_params }
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

    
    test "delete non-existent task" do
        sign_in users(:one)

        # base de donnees
        assert_no_difference "Task.count" do
          delete api_task_path(-1)
        end

        # code http
        assert_response :not_found

        # format reponse
        json = JSON.parse(response.body)

        # donne reponse
        assert_equal "not_found", json["error"]
    end

    test "should not destroy one task  and return 401 user not connect" do
      # base de donnees
      assert_no_difference "Task.count" do
            delete api_task_path(@task_three)
        end

      # code http
      assert_response :success

      # format reponse
      json = JSON.parse(response.body)

      # donne reponse
      assert_equal "error", json["status"]
    end

       test "cannot create a task without type params " do
      sign_in users(:one)
        # base de donnees
        assert_no_difference "Task.count", "Anime should not be created with invalid param" do
             post api_tasks_path, params: { task: invalid_task_params }
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

    test "can not create task while log out" do
        # base de donnees
        assert_no_difference "Task.count" do
            post api_tasks_path, params: { task: valid_task_params }
          # puts response.body
        end
            # code http
            assert_response :success

            # format reponse
            json = JSON.parse(response.body)

            # donne reponse
            assert_equal "error", json["status"]
    end

     def valid_task_params
        {
            title: "creation de task",
            description: "description de tache valide",
            priority: 1,
            difficulty: 1,
            reusable: true,
            file: @image
        }
    end

    def invalid_task_params
        {
            title: nil,
            description: nil,
            priority: -1,
            difficulty: 11,
            reusable: false,
            file: @image
        }
    end
end