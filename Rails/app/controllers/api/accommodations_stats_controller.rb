class Api::AccommodationsStatsController < ApiController
  before_action :require_admin!

  def index
    accommodations = Accommodation.with_stats_data

    all_stats = accommodations.map(&:statistics_data)
                             .sort_by { |s| s[:finance][:total_revenue] }
                             .reverse

    grouped_data = all_stats.group_by { |s| s[:festival_id] }

    render json: {
      status: "success",
      highlights: {
        highest_earner: all_stats.first&.slice(:name, :finance),
        lowest_earner: all_stats.last&.slice(:name, :finance)
      },
      data: grouped_data
    }, status: :ok
  rescue StandardError => e
    render_error("Erreur lors de la génération des statistiques : #{e.message}")
  end
end
