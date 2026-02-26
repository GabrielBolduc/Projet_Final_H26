class Api::AccommodationsController < ApiController
  skip_before_action :authenticate_user!, only: [:index, :show], raise: false
  before_action :set_accommodation, only: [:show, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  def index
    @accommodations = Accommodation.joins(:festival).merge(Festival.ongoing)

    if params[:category].present? && params[:category] != 'all'
      @accommodations = @accommodations.where(category: params[:category])
    end

    render json: { status: "success", data: @accommodations }, status: :ok
  end

  def show
    render json: { 
      status: "success", 
      data: @accommodation.as_json(except: [:created_at, :updated_at]) 
    }
  end

  def create
    festival = Festival.ongoing.order(created_at: :desc).first

    if festival.nil?
      return render_logic_error(["No festival is currently ongoing. Accommodations cannot be created."])
    end

    @accommodation = Accommodation.new(accommodation_params)
    @accommodation.festival = festival

    if @accommodation.save
      render json: { status: "success", data: @accommodation }, status: :ok
    else
      render_logic_error(@accommodation.errors.full_messages)
    end
  end

  def update
    if @accommodation.update(accommodation_params)
      render json: { status: "success", data: @accommodation }, status: :ok
    else
      render_logic_error(@accommodation.errors.full_messages)
    end
  end

  def destroy
    @accommodation.destroy
    render json: { status: "success", message: "Accommodation deleted" }, status: :ok
  end

  private
  def set_accommodation
    @accommodation = Accommodation.find_by(id: params[:id])
    render_logic_error("Accommodation not found") unless @accommodation
  end

  def accommodation_params
    params.require(:accommodation).permit(
      :name, :category, :address, :latitude, :longitude, 
      :shuttle, :time_car, :time_walk, :commission
    )
  end
  
  def render_logic_error(message)
    render json: { 
      status: "error", 
      message: message 
    }, status: :ok
  end

  def require_admin!
    unless current_user&.is_a?(Admin)
      render_logic_error("Access denied: Admin privileges required.")
    end
  end
end
