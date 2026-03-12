class Api::AccommodationsStatsController < ApiController
  before_action :require_admin!

  def index
    @accommodations = Accommodation.with_stats_data

    @festival_highlights = calculate_festival_highlights(@accommodations)

    apply_filters!

    if params[:sort_by] == "revenue"
      @accommodations = @accommodations.reorder("raw_revenue DESC")
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

  def calculate_festival_highlights(scope)
    scope.to_a.group_by(&:festival_id).transform_values do |accs|
      {
        top: accs.max_by(&:raw_revenue)&.statistics_data&.slice(:name, :finance),
        bottom: accs.min_by(&:raw_revenue)&.statistics_data&.slice(:name, :finance)
      }
    end
  end

  def apply_filters!
    @accommodations = @accommodations.search_by_name(params[:name]) if params[:name].present?
    @accommodations = @accommodations.for_festivals(params[:festival_ids]) if params[:festival_ids].present?

    if params[:date_after].present? || params[:date_before].present?
      @accommodations = @accommodations.by_festival_date(params[:date_after], params[:date_before])
    end
  end

  def apply_sql_sorting(scope)
    case params[:sort_by]
    when "name" then scope.reorder("accommodations.name ASC")
    else scope.reorder("festivals.start_at DESC")
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
        highlights: @festival_highlights[festival.id] || { top: nil, bottom: nil },
        reservation_stats: {
          total_people: list.sum { |s| s.dig(:reservation_stats, :total_people) || 0 }
        }
      }
    end
  end
end
