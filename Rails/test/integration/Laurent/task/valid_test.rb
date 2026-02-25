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
 
 test "should show one task and return JSON" do
    sign_in users(:one)
    # base de donnees
    assert_no_difference("Task.count") do
      get api_task_path(@task_one)
    end

    # code http
    assert_response :success

    # format de reponse
    assert_nothing_raised { JSON.parse(response.body) }
    json_response = JSON.parse(response.body)

     # contenu de reponse
     assert_equal @task_one.id, json_response["data"]["id"]
    assert_equal @task_one.title, json_response["data"]["title"]
    assert_equal @task_one.description, json_response["data"]["description"]
    assert_equal @task_one.reusable, json_response["data"]["reusable"]
    assert_equal @task_one.difficulty, json_response["data"]["difficulty"]
    assert_equal @task_one.priority, json_response["data"]["priority"]
  end

   # get /api/tasks
  test "should get tasks list and return JSON" do
    sign_in users(:one)
    # la base de donnée n'a pas changer
    assert_no_difference("Task.count") do
     get api_tasks_path
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

  test "should get rhe reusables tasks list and return JSON" do
    sign_in users(:one)
    # la base de donnée n'a pas changer
    assert_no_difference("Task.count") do
     get get_reusable_api_tasks_path
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

  test "can update task" do
        sign_in users(:one)

        # base de donnees
        assert_no_difference "Task.count" do
            patch  api_task_path(@task_one), params: { task: valid_task_params }
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

    test " can delete task" do
        sign_in users(:one)

        # base de donnees
        assert_difference "Task.count", -1 do
            delete api_task_path(@task_three)
        end

        # format de reponse
        assert_nothing_raised { JSON.parse(response.body) }

        # code http
        assert_response :success
        json_response = JSON.parse(response.body)

        # contenu de reponse
        assert_equal true, json_response["success"], "Task should be deleted"
    end

 test "can create anime" do
        sign_in users(:one)

        # base de donnees
        assert_difference "Task.count", 1 do
            post api_tasks_path, params: { task: valid_task_params }
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
end