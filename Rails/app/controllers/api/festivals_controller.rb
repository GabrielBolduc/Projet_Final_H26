class Api::FestivalsController < ApiController
  skip_before_action :authenticate_user!, only: [:index, :show], raise: false

  def index
    festivals = Festival.all
    
    render json: {
      status: "success",
      data: festivals.as_json(except: [:coordinates])
    }, status: :ok
  end

  def show
    festival = Festival.find_by(id: params[:id])

    if festival
      render json: {
        status: "success",
        data: festival.as_json(except: [:coordinates])
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Resource not found",
        code: 404
      }, status: :ok
    end
  end
end