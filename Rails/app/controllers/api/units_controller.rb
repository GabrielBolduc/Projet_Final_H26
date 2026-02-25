class Api::UnitsController < ApiController
    before_action :set_unit, only: [:show, :update, :destroy] 
    before_action :require_admin!

    def index
    @accommodation = Accommodation.find(params[:accommodation_id] || params[:id])
    @units = @accommodation.units.with_attached_image
    
    render json: { 
        status: "success", 
        data: @units.map { |u| u.as_json.merge(image_url: url_for(u.image)) } 
    }
    end

    def show
        render json: { status: "success", data: @unit }, status: :ok
    end

    def create
        @accommodation = Accommodation.find_by(id: params[:accommodation_id])
        return render_logic_error("Accommodation not found") unless @accommodation

        @unit = @accommodation.units.new(unit_params)

        if @unit.save
        render json: { status: "success", data: @unit }, status: :ok
        else
        render_logic_error(@unit.errors.full_messages)
        end
    end

    def update
        if @unit.update(unit_params)
        render json: { status: "success", data: @unit }, status: :ok
        else
        render_logic_error(@unit.errors.full_messages)
        end
    end

    def destroy
        @unit.destroy
        render json: { status: "success", message: "Unit deleted" }, status: :ok
    end

    private

    def set_unit
        @unit = Unit.find_by(id: params[:id])
        render_logic_error("Unit not found") unless @unit
    end

    def unit_params
        params.require(:unit).permit(
            :type, :cost_person_per_night, :quantity, :wifi, 
            :water, :electricity, :parking_cost, :image,
            food_options: []
        )
    end

    def require_admin!
        unless current_user&.is_a?(Admin)
        render_logic_error("Access denied: Admin privileges required.")
        end
    end

    def render_logic_error(message)
        render json: { status: "error", message: message }, status: :ok
    end
end
