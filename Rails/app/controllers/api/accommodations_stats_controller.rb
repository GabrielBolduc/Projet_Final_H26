class Api::AccommodationsStatsController < ApiController
  before_action :require_admin!

  def index
    accommodations = Accommodation.with_stats_data

    all_stats = accommodations.map(&:statistics_data)
                              .sort_by { |s| s[:finance][:total_revenue] }
                              .reverse

    grouped_data = accommodations.group_by(&:festival)
                                .sort_by { |festival, _| festival.start_at }
                                .reverse
                                .each_with_object({}) do |(festival, list), hash|
      
      stats_list = list.map(&:statistics_data)
                      .sort_by { |s| s[:finance][:total_revenue] }
                      .reverse

      hash[festival.name] = {
        items: stats_list,
        highlights: {
          top: stats_list.first&.slice(:name, :finance),
          bottom: stats_list.last&.slice(:name, :finance)
        }
      }
    end

    render json: {
      status: "success",
      highlights: {
        highest_earner: all_stats.first&.slice(:name, :finance),
        lowest_earner: all_stats.last&.slice(:name, :finance)
      },
      data: grouped_data
    }, status: :ok
  rescue StandardError => e
    render_error("Erreur : #{e.message}")
  end
end
