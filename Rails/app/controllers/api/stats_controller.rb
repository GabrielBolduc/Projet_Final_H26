class Api::StatsController < ApiController
  before_action :require_admin!

  def festivals
    stats = Festival.statistics_report

    render json: {
      status: "success",
      data: stats
    }, status: :ok
  end
end