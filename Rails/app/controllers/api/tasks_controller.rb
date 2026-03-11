class Api::TasksController < ApiController
    before_action :authenticate_user!
    before_action :set_task, only: %i[show update destroy]
    before_action :require_admin!, only: [ :create, :update, :destroy ]


   def index
        @tasks = Task.all

        if params[:search].present?
            @tasks = @tasks.where("title LIKE ?", "%#{params[:search]}%")
        end

        if params[:status] == "completed"
            @tasks = @tasks.where.not(id: Affectation.where(end: nil).select(:task_id))
        end

        if params[:status] == "ongoing"
            @tasks = @tasks.where(
                id: Affectation
                .where.not(start: nil)
                .where(end: nil)
                .select(:task_id)
            )
        end


        case params[:orderBy]

        when "affectation"
            @tasks = @tasks.left_joins(:affectations)
                        .group("tasks.id")
                        .order("COUNT(affectations.id)")

        when "priority"
            @tasks = @tasks.order(:priority)

        when "difficulty"
            @tasks = @tasks.order(:difficulty)

        else
            @tasks = @tasks.order(:updated_at)

        end

        if params[:order] == "desc"
            @tasks = @tasks.reverse_order
        end

        render json: {
            status: "success",
            data: @tasks.as_json(task_json)
        }, status: :ok
    end

    def raport
        @tasks = Task.all

        @tasks_count = Task.all.count

        @tasks_completed = @tasks.where.not(id: Affectation.where(end: nil).select(:task_id)).count

        @tasks_ongoing = @tasks.where(
                id: Affectation
                .where.not(start: nil)
                .where(end: nil)
                .select(:task_id)
            ).count

        @tasks_waiting = @tasks.where(
                id: Affectation
                .where(start: nil)
                .where(end: nil)
                .select(:task_id)
            ).count

        render json: {
            status: "success",
            data: {
            tasks_count: @tasks_count,
            tasks_completed: @tasks_completed,
            tasks_ongoing: @tasks_ongoing,
            tasks_waiting: @tasks_waiting
            }
        }, status: :ok
    end

    def show
       render json: {
        status: "success",
        data: @task.as_json(task_json)
        }, status: :ok
    end

    def get_reusable
        @tasks = Task.where(reusable: true)
        render json: {
        status: "success",
        data: @tasks.as_json(task_json)
        }, status: :ok
    end

    def destroy
        if @task.destroy
            render json: { success: true }, status: :ok
        else
            render json: { success: false, errors: [ { base: "Une erreur s'est produite lors de la suppression de la tache" } ] }, status: :ok
        end
    end

    def create
        @task = Task.new(task_params)
        if @task.save

            render json: @task.as_json(task_json).merge(success: true), status: :ok
        else
            render json: { success: false, errors: @task.errors.full_messages }, status: :unprocessable_entity
        end
    end
    def update
        if @task.update(task_params)

            render json: @task.as_json(task_json).merge(success: true), status: :ok
        else
            render json: { success: false, errors: @task.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def set_task
        @task = Task.find(params[:id])

        unless @task.present?
            render json: { success: false, errors: [ { base: "Tache non trouver ou inexistante" } ] }, status: :ok
        end
    end

    def task_json
        {
            success: true,
            only: [ :id, :title, :description, :reusable, :difficulty, :priority ],
             methods: [ :file_url, :affectations_count, :completed ]
        }
    end

    def task_params
        params.require(:task).permit(
        :title,
        :description,
        :reusable,
        :difficulty,
        :priority,
        :file
        )
    end
end
