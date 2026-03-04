class Api::PerformancesController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  before_action :set_performance, only: [ :show, :update, :destroy ]

  def index
    performances = Performance.with_details.chronological
    
    if params[:festival_id].present?
      performances = performances.for_festival(params[:festival_id])
    end

    if params[:stage_id].present?
      performances = performances.by_stage(params[:stage_id])
    end

    if params[:search].present?
      performances = performances.search(params[:search])
    end

    unless current_user&.is_a?(Admin)
      performances = performances.publicly_visible
    end

    render json: {
      status: "success",
      data: performances.as_json(json_options)
    }, status: :ok
  end

  def show
    unless current_user&.is_a?(Admin) || @performance.festival.ongoing?
      return render json: {
        status: "error",
        message: "Performance non publique"
      }, status: :ok
    end

    render json: {
      status: "success",
      data: @performance.as_json(json_options)
    }, status: :ok
  end

  def create
    performance = Performance.new(performance_params)

    if performance.save
      render json: {
        status: "success",
        data: performance.as_json(json_options)
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la validation",
        errors: performance.errors.messages
      }, status: :ok
    end
  end

  def update
    if @performance.update(performance_params)
      render json: {
        status: "success",
        data: @performance.as_json(json_options)
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la mise à jour",
        errors: @performance.errors.messages
      }, status: :ok
    end
  end

  def destroy
    if @performance.destroy
      render json: {
        status: "success",
        message: "Performance supprimée avec succes",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Impossible de supprimer performance"
      }, status: :ok
    end
  end

  private

  def set_performance
    @performance = Performance.with_details.find(params[:id])
  end

  def performance_params
    params.require(:performance).permit(
      :title, :description, :price, :start_at, :end_at,
      :artist_id, :stage_id, :festival_id
    )
  end

  def json_options
    {
      include: {
        stage: { only: [ :id, :name ] },
        festival: { only: [ :id, :name, :status ] },
        artist: { methods: [ :image_url ], only: [ :id, :name, :genre ] }
      }
    }
  end
end
