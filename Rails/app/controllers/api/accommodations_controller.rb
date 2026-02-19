class Api::AccommodationsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false

  def index
    @units = Unit.all.includes(:accommodation, image_attachment: :blob)

    if params[:category].present? && params[:category] != 'all'
      @units = @units.joins(:accommodation).where(accommodations: { category: params[:category] })
    end

    render json: { status: "success", data: format_units(@units) }
  end

  def show
    if @unit
      render json: { status: "success", data: format_unit(@unit) }, status: :ok
    else
      render json: { status: "error", code: 404, message: "Unit not found" }, status: :not_found
    end
  end

  def create
    unit = Unit.new(unit_params)
    if unit.save
      render json: { status: "success", data: format_unit(unit) }, status: :created
    else
      render json: { status: "error", code: 422, message: "Validation failed", errors: unit.errors.messages }, status: :unprocessable_entity
    end
  end

  def update
    if @unit
      if @unit.update(unit_params)
        render json: { status: "success", data: format_unit(@unit) }, status: :ok
      else
        render json: { status: "error", code: 422, message: "Validation failed", errors: @unit.errors.messages }, status: :unprocessable_entity
      end
    else
      render json: { status: "error", code: 404, message: "Unit not found" }, status: :not_found
    end
  end

  def destroy
    if @unit
      @unit.destroy
      render json: { status: "success", message: "Unit deleted successfully", data: nil }, status: :ok
    else
      render json: { status: "error", code: 404, message: "Unit not found" }, status: :not_found
    end
  end

  private
  def set_unit
    @unit = Unit.includes(:accommodation, image_attachment: :blob).find_by(id: params[:id])
  end

  def unit_params
    params.require(:unit).permit(
      :cost_person_per_night, :type, :quantity, :wifi, :water, 
      :electricity, :parking_cost, :food_options, :accommodation_id, :image
    )
  end
  
  def require_admin!
    unless current_user.is_a?(Admin)
      render json: {
        status: "error",
        code: 403,
        message: "Access denied: Admin privileges required."
      }, status: :forbidden
    end
  end

  def format_unit(unit)
    unit.as_json(
      include: { 
        accommodation: { 
          only: [:name, :category, :address, :shuttle], 
          methods: [:coordinates] 
        } 
      }
    ).merge(
      "image_url" => unit.image.attached? ? url_for(unit.image) : nil
    )
  end

  def format_units(units)
    units.map { |unit| format_unit(unit) }
  end
end
