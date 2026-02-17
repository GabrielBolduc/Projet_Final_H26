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

  #get /api/tasks
  test "should get tasks list and return JSON" do
    sign_in users(:one)
    #la base de donnée n'a pas changer
    assert_no_difference("Task.count") do
     get api_tasks_path
    end
    
    # code http
    assert_response :success
    
    # format de reponse en JSON
    assert_nothing_raised { JSON.parse(response.body) }
      json_response = JSON.parse(response.body)

     assert json_response.is_a?(Hash)
    assert_equal "success", json_response["status"]
    assert json_response["data"].is_a?(Array), "data should be an array"

  end


end
