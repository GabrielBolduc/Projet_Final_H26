class Api::TasksController < ApiController
    before_action :authenticate_user!
    before_action :set_task, only: %i[show update destroy]

    def index

        #order = params[:order] == 'desc' ? :asc : :desc

        @tasks = Task.all.order(updated_at: :desc)

        

        if params[:completed].present?
        @tasks = @tasks.where.not( id: Affectation.where(end: nil).select(:task_id))
        end

        if params[:user_name].present?
          user_name = params[:user_name]
          @tasks = @tasks.joins(affectations: :user).where("users.name ILIKE ?", "%#{user_name}%").order(updated_at: order)
        end

        if params[:title].present?
          title = params[:title]
          @tasks = @tasks.where("tasks.title ILIKE ?", "%#{title}%").order(updated_at: order)
        end

        if params[:difficulty].present?
            difficulty = params[:difficulty]
            @tasks = @tasks.where(difficulty: difficulty).order(updated_at: order)
        end

        if params[:priority].present?
            priority = params[:priority]
            @tasks = @tasks.where(priority: priority).order(updated_at: order)
        end

        render json: {
        status: "success",
        data: @tasks.as_json(task_json)
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
             methods: [ :file_url]
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
