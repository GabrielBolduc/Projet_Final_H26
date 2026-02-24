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
