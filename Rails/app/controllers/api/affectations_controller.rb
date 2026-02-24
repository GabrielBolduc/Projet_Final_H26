class Api::AffectationsController < ApiController
    before_action :authenticate_user!
    before_action :set_affectation, only: %i[show update destroy]

    

    def show
       render json: {
        status: "success",
        data: @affectation.as_json(affectation_json)
        }, status: :ok
    end

    def get_by_task
        @affectations = Affectation.where(task_id: params[:task_id]).order(updated_at: :desc)   
        render json: {
        status: "success",
        data: @affectations.as_json(affectation_json)
        }, status: :ok
    end

    def get_by_user
        @affectations = Affectation.where(user_id: params[:user_id]).order(updated_at: :desc)

        render json: {
        status: "success",
        data: @affectations.as_json(affectation_json)
        }, status: :ok
    end

    def destroy
        if @affectation.destroy
            render json: { success: true }, status: :ok
        else
            render json: { success: false, errors: [ { base: "Une erreur s'est produite lors de la suppression de l'affectation" } ] }, status: :ok
        end
    end

    def create
        @affectation = Affectation.new(affectation_params)
        if @affectation.save
            
            render json: @affectation.as_json(affectation_json).merge(success: true), status: :ok
        else
            render json: { success: false, errors: @affectation.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def update
        if @affectation.update(affectation_params)
            
            render json: @affectation.as_json(affectation_json).merge(success: true), status: :ok
        else
            render json: { success: false, errors: @affectation.errors.full_messages }, status: :unprocessable_entity
        end
    end

    private

    def affectation_json
        {
            success: true,
            only: [ :id, :status, :start, :end, :expected_start, :expected_end, :responsability ],
             
            include: {
                task: {
                    only: [ :id, :name, :description, :reusable ],
                    methods: [ :file_url]
                }
            }
        }
    end

    def set_affectation
        @affectation = Affectation.find(params[:id])

        unless @affectation.present?
            render json: { success: false, errors: [ { base: "Affectation non trouver ou inexistante" } ] }, status: :ok
        end
    end

    def affectation_params
        params.require(:affectation).permit(
            :user_id, 
            :task_id,
            :festival_id, 
            :status, 
            :start, 
            :end, 
            :expected_start, 
            :expected_end, 
            :responsability
            )
    end

end