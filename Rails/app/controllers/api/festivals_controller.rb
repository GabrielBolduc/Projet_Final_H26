class Api::FestivalsController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response

  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  
  # 2. On charge le festival avant d'entrer dans l'action
  before_action :set_festival, only: [ :show ]

  def index
    festivals = Festival.all

    render json: {
      status: "success",
      data: festivals.as_json
    }, status: :ok
  end

  def show
    render json: {
      status: "success",
      data: @festival.as_json
    }, status: :ok
  end

  private

  def set_festival
    @festival = Festival.find(params[:id])
  end

  def not_found_response
    render json: {
      status: "error",
      message: "Resource not found"
    }, status: :ok
  end
end