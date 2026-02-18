class Api::PerformancesController < ApiController
  skip_before_action :authenticate_user!, only: [:index, :show], raise: false
  before_action :set_performance, only: [:show, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  def index
    performances = Performance.includes(:artist, :stage, :festival).all

    render json: {
      status: "success",
      data: performances.as_json(include: [:artist, :stage, :festival])
    }, status: :ok
  end

  def show
    if @performance
      render json: {
        status: "success",
        data: @performance.as_json(include: [:artist, :stage, :festival])
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance not found"
      }, status: :ok
    end
  end
  
  def create
    performance = Performance.new(performance_params)

    if performance.save
      render json: {
        status: "success",
        data: performance.as_json(include: [:artist, :stage, :festival])
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 422,
        message: "Validation failed",
        errors: performance.errors
      }, status: :ok
    end
  end

  def update
    if @performance
      if @performance.update(performance_params)
        render json: {
          status: "success",
          data: @performance.as_json(include: [:artist, :stage, :festival])
        }, status: :ok
      else
        render json: {
          status: "error",
          code: 422,
          message: "Validation failed",
          errors: @performance.errors
        }, status: :ok
      end 
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance not found"
      }, status: :ok
    end
  end

  def destroy
    if @performance
      @performance.destroy
      render json: {
        status: "success",
        message: "Performance deleted successfully",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance not found"
      }, status: :ok
    end
  end

  private

  def set_performance
    @performance = Performance.includes(:artist, :stage, :festival).find_by(id: params[:id])
  end

  def performance_params
    params.require(:performance).permit(
      :title, :description, :price, :start_at, :end_at, 
      :artist_id, :stage_id, :festival_id
    )
  end

  def require_admin!
    unless current_user.is_a?(Admin)
      render json: {
        status: "error",
        code: 403,
        message: "Access denied: Admin privileges required."
      }, status: :ok
    end
  end
end