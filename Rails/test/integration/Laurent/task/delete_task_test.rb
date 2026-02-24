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

end