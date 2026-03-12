class Api::AccommodationsStatsController < ApiController
  before_action :require_admin!

  def index
    @accommodations = Accommodation.with_stats_data

    apply_filters!

    if params[:sort_by] == "revenue"
      @accommodations = @accommodations.order("raw_revenue DESC")
    else
      @accommodations = apply_sql_sorting(@accommodations)
    end

    all_stats = @accommodations.map do |acc|
      { acc: acc, stats: acc.statistics_data }
    end

    grouped_data = render_grouped_stats(all_stats)

    render json: { status: "success", data: grouped_data }, status: :ok
  rescue StandardError => e
    render_error("Erreur : #{e.message}")
  end

  private

  def apply_filters!
    @accommodations = @accommodations.search_by_name(params[:name]) if params[:name].present?
    @accommodations = @accommodations.for_festivals(params[:festival_ids]) if params[:festival_ids].present?

    if params[:date_after].present? || params[:date_before].present?
      @accommodations = @accommodations.by_festival_date(params[:date_after], params[:date_before])
    end
  end

  def apply_sql_sorting(scope)
    case params[:sort_by]
    when "name" then scope.order("accommodations.name ASC")
    else scope.order("festivals.start_at DESC")
    end
  end

  def render_grouped_stats(all_stats)
    all_stats.group_by { |item| item[:acc].festival }
             .sort_by { |fest, _| fest.start_at || Time.at(0) }
             .reverse
             .each_with_object({}) do |(festival, items), hash|
      
      list = items.map { |i| i[:stats] }

      hash[festival.name] = {
        items: list,
        counts: {
          camping: items.count { |i| i[:acc].camping? },
          hotel: items.count { |i| i[:acc].hotel? }
        },
        highlights: {
          top: list.first&.slice(:name, :finance),
          bottom: list.last&.slice(:name, :finance)
        },
        reservation_stats: {
          total_people: list.sum { |s| s.dig(:reservation_stats, :total_people) || 0 }
        }
      }
    end
  end
end
