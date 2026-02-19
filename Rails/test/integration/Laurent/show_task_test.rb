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
end