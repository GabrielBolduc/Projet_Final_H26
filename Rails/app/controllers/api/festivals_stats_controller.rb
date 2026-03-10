class Api::FestivalsStatsController < ApiController
  before_action :require_admin!

  def festivals
    festivals = Festival.with_stats_data

    stats = festivals.map(&:statistics_data)

    render json: {
      status: "success",
      data: stats
    }, status: :ok
  end
end