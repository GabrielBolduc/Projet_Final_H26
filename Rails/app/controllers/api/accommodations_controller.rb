class Api::AccommodationsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :set_accommodation, only: [ :show, :update, :destroy ]
  before_action :require_admin!, only: [ :create, :update, :destroy ]

  def index
    @festival = Festival.ongoing.first
    return render_validation_success([]) if @festival.nil?

    @accommodations = @festival.accommodations.includes(units: { image_attachment: :blob })

    @accommodations = @accommodations.search_by_name(params[:name]) if params[:name].present?
    @accommodations = @accommodations.where(category: params[:category]) if params[:category].present? && params[:category] != "all"
    @accommodations = @accommodations.within_radius(@festival.latitude, @festival.longitude, params[:max_distance]) if params[:max_distance].present?
    @accommodations = @accommodations.with_units_matching(params) if has_unit_filters?

    data = @accommodations.map { |acc| acc.as_json(base_url: request.base_url) }
    render_validation_success(data)
  end

  def show
    render_validation_success(@accommodation.as_json(base_url: request.base_url))
  end

  def create
    @festival = Festival.ongoing.order(created_at: :desc).first
    return render_error("No ongoing festival.") if @festival.nil?

    @accommodation = @festival.accommodations.new(accommodation_params)
    if @accommodation.save
      render_validation_success(@accommodation.as_json(base_url: request.base_url))
    else
      render_validation_error(@accommodation)
    end
  end

  def update
    if @accommodation.update(accommodation_params)
      render_validation_success(@accommodation.as_json(base_url: request.base_url))
    else
      render_validation_error(@accommodation)
    end
  end

  def destroy
    @accommodation.destroy
    render json: { status: "success", message: "Deleted" }, status: :ok
  end

  private

  def set_accommodation
    @accommodation = Accommodation.find(params[:id])
  end

  def accommodation_params
    params.require(:accommodation).permit(:name, :category, :address, :latitude, :longitude, :shuttle, :time_car, :time_walk, :commission)
  end

  def has_unit_filters?
    [ :wifi, :electricity, :water, :min_people, :max_price ].any? { |k| params[k].present? }
  end
end
