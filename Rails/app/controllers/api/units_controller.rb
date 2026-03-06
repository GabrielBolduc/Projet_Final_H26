class Api::UnitsController < ApiController
  before_action :set_unit, only: [ :show, :update, :destroy ]
  before_action :require_admin!, except: [ :index, :show ]

  def index
    @accommodation = Accommodation.find(params[:accommodation_id])
    @units = @accommodation.units.with_attached_image
    render_validation_success(@units.map { |u| u.as_json(base_url: request.base_url) })
  end

  def show
    render_validation_success(@unit.as_json(base_url: request.base_url))
  end

  def create
    @accommodation = Accommodation.find(params[:accommodation_id])
    @unit = @accommodation.units.new(unit_params)
    if @unit.save
      render_validation_success(@unit.as_json(base_url: request.base_url))
    else
      render_validation_error(@unit)
    end
  end

  def update
    if @unit.update(unit_params)
      render_validation_success(@unit.as_json(base_url: request.base_url))
    else
      render_validation_error(@unit)
    end
  end

  def destroy
    @unit.destroy
    render json: { status: "success" }, status: :ok
  end

  private

  def set_unit
    @unit = Unit.find(params[:id])
  end

  def unit_params
    params.require(:unit).permit(:type, :cost_person_per_night, :quantity, :wifi, :water, :electricity, :parking_cost, :image, food_options: [])
  end
end
