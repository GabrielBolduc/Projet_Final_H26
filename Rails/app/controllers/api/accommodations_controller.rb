class Api::AccommodationsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false

  def index
    @units = Unit.all.includes(:accommodation, image_attachment: :blob)
    render json: { status: "success", data: format_units(@units) }
  end

def show
  @unit = Unit.find_by(id: params[:id])

  if @unit
    unit_data = @unit.as_json(include: {
      accommodation: { methods: [ :coordinates ] }
    }).merge(
      "image_url" => @unit.image.attached? ? url_for(@unit.image) : nil
    )
    render json: { status: "success", data: unit_data }
  else
    # This ensures a 200 OK with your custom error format
    render json: { status: "error", message: "Unit not found" }, status: :ok
  end
end

  private

  def format_units(units)
    units.map do |unit|
      unit.as_json(
        include: { accommodation: { only: [ :name ], methods: [ :coordinates ] } }
      ).merge(
        "image_url" => unit.image.attached? ? url_for(unit.image) : nil
      )
    end
  end
end
