class Api::FestivalsStatsController < ApiController
  before_action :require_admin!

  def festivals
    festivals = Festival.recent
                        .filter_by_year(params[:year])
                        .filter_by_ids(params[:festival_id])

    stats = festivals.map(&:statistics_data)

    render json: {
      status: "success",
      data: {
        global: Festival.global_stats,
        list: stats                    
      }
    }, status: :ok
  end
end