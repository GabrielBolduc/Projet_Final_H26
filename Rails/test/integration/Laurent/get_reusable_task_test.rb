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

  # get /api/tasks
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

  # get /api/tasks
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

end