class Api::AccommodationsStatsController < ApiController
  before_action :require_admin!

  def index
    accommodations = Accommodation.with_stats_data

    grouped_data = accommodations.group_by(&:festival)
                                .sort_by { |festival, _| festival.start_at }
                                .reverse
                                .each_with_object({}) do |(festival, list), hash|
      
      stats_list = list.map(&:statistics_data)
                      .sort_by { |s| s[:finance][:total_revenue] }
                      .reverse

      hash[festival.name] = {
        items: stats_list,
        counts: {
          camping: list.count { |a| a.category_before_type_cast == 0 },
          hotel: list.count { |a| a.category_before_type_cast == 1 }
        },
        highlights: {
          top: stats_list.first&.slice(:name, :finance),
          bottom: stats_list.last&.slice(:name, :finance)
        },
        reservation_stats: {
          total_people: stats_list.sum { |s| s[:reservation_stats][:total_people] || 0 }
        }
      }
    end

    render json: {
      status: "success",
      data: grouped_data
    }, status: :ok
  rescue StandardError => e
    render_error("Erreur : #{e.message}")
  end
end
