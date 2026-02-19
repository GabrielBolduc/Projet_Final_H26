class Api::StagesController < ApiController
  def index
    @stages = Stage.all

    render json: {
      status: 'success',
      data: @stages,
    }, status: :ok
  end
end