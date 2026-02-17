class Api::FestivalsController < ApiController
  skip_before_action :authenticate_user!, only: [:index, :show], raise: false

    def index
      festivals = Festival.all
      render json: festivals.as_json(except: [:coordinates])
    end

    def show
      festival = Festival.find(params[:id])
      render json: festival.as_json(except: [:coordinates])
    end
end