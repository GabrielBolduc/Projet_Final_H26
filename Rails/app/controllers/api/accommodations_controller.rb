class Api::AccommodationsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false

  def index
    @units = Unit.all.includes(:accommodation, image_attachment: :blob)
    render json: { status: "success", data: format_units(@units) }
  end

  def show
    @unit = Unit.find(params[:id])

    unit_data = @unit.as_json(include: {
      accommodation: { methods: [ :coordinates ] }
    })

    render json: {
      status: "success",
      data: @unit.as_json.merge(image_url: url_for(@unit.image))
    }
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
