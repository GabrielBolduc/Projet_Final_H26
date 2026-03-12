class Accommodation < ApplicationRecord
  belongs_to :festival
  has_many :units, dependent: :destroy

  before_destroy :ensure_no_units_have_reservations, prepend: true

  enum :category, { camping: 0, hotel: 1 }

  validates :name, presence: true, length: { maximum: 100 }
  validates :address, presence: true
  validates :commission, numericality: { greater_than_or_equal_to: 0, less_than: 30 }
  validates :latitude, :longitude, presence: true
  validates :time_car, :time_walk, presence: true

  scope :with_stats_data, -> {
    left_joins(:festival)
      .left_joins(units: :reservations)
      .select("accommodations.*")
      .select("festivals.name AS festival_name_val")
      .select("AVG(units.cost_person_per_night) AS avg_nightly_rate_val")
      .select("AVG(IF(units.parking_cost > 0, units.parking_cost, NULL)) AS avg_parking_fee_val")
      .select("SUM(IF(reservations.status IN (0, 2), reservations.nb_of_people, 0)) AS total_people_val")
      .select(<<-SQL.squish)
        SUM(IF(reservations.status IN (0, 2), 
          reservations.nb_of_people * units.cost_person_per_night * 
          GREATEST(TIMESTAMPDIFF(DAY, reservations.arrival_at, reservations.departure_at), 1), 
          0)) AS raw_revenue
      SQL
      .select("COUNT(DISTINCT IF(reservations.status IN (0, 2), reservations.id, NULL)) AS total_bookings_val")
      .select("COUNT(DISTINCT units.id) AS unit_count_val")
      .select("SUM(units.quantity) AS total_units_qty_val")
      .select(<<-SQL.squish)
        ST_Distance_Sphere(
          POINT(accommodations.longitude, accommodations.latitude),
          POINT(festivals.longitude, festivals.latitude)
        ) / 1000 AS distance_from_festival_km
      SQL
      .group("accommodations.id, festivals.id, festivals.name")
  }
  scope :search_by_name, ->(term) {
    where("accommodations.name LIKE ?", "%#{term}%")
  }
  scope :within_walk_time, ->(max_time) { where("time_walk <= ?", max_time) }
  scope :within_radius, ->(f_lat, f_lng, radius_km) {
    radius_meters = radius_km.to_f * 1000
    where(
      "ST_Distance_Sphere(
        POINT(longitude, latitude),
        POINT(?, ?)
      ) <= ?",
      f_lng, f_lat, radius_meters
    )
  }
  scope :with_units_matching, ->(p) {
    unit_query = Unit.all

    if p[:category] == "camping"
      unit_query = unit_query.where("type LIKE ?", "Units::%Terrain%")
    elsif p[:category] == "hotel"
      unit_query = unit_query.where("type LIKE ?", "Units::%Room%")
    end

    unit_query = unit_query.where(type: p[:type]) if p[:type].present?

    unit_query = unit_query.has_wifi(true) if p[:wifi] == "true"
    unit_query = unit_query.has_electricity(true) if p[:electricity] == "true"
    unit_query = unit_query.with_water_quality(p[:water]) if p[:water].present?
    unit_query = unit_query.price_under(p[:max_price]) if p[:max_price].present?

    joins(:units).merge(unit_query).distinct
  }
  scope :for_festivals, ->(ids) {
    where(festival_id: Array(ids).compact_blank)
  }
  scope :by_festival_date, ->(after, before) {
    query = joins(:festival)
    query = query.where("festivals.start_at >= ?", after) if after.present?
    query = query.where("festivals.start_at <= ?", before) if before.present?
    query
  }


  before_validation :strip_fields

  def statistics_data
    people   = respond_to?(:total_people_val) ? total_people_val.to_i : 0
    bookings = respond_to?(:total_bookings_val) ? total_bookings_val.to_i : 0
    revenue  = respond_to?(:raw_revenue) ? raw_revenue.to_f : 0
    total_q  = respond_to?(:total_units_qty_val) ? total_units_qty_val.to_i : 0
    f_name   = respond_to?(:festival_name_val) ? festival_name_val : festival&.name
    avg_parking = respond_to?(:avg_parking_fee_val) ? avg_parking_fee_val.to_f : 0

    {
      id: id,
      festival_id: festival_id,
      name: name,
      festival_name: f_name,
      category: category_before_type_cast,
      unit_count: respond_to?(:unit_count_val) ? unit_count_val.to_i : units.size,
      
      pricing: {
        avg_nightly_rate: (respond_to?(:avg_nightly_rate_val) ? avg_nightly_rate_val.to_f : 0).round(2),
        avg_parking_fee: (respond_to?(:avg_parking_fee_val) ? avg_parking_fee_val.to_f : 0).round(2)
      },

      services: {
        wifi: summarize_service(units.map(&:wifi)),
        electricity: summarize_service(units.map(&:electricity)),
        water: summarize_water_quality,
        parking: (respond_to?(:avg_parking_fee_val) && avg_parking_fee_val.to_f > 0) ? "available" : "none"
      },

      location: {
        address: address,
        distance_km: respond_to?(:distance_from_festival_km) ? distance_from_festival_km.to_f.round(2) : 0
      },

      finance: {
        total_revenue: revenue.round(2),
        actual_profit: (revenue * (100 - commission) / 100.0).round(2),
        commission_rate: "#{commission}%"
      },

      inventory: {
        total_units: total_q,
        available_now: [total_q - bookings, 0].max
      },

      reservation_stats: {
        total_people: people,
        total_count: bookings
      }
    }
  end

  def as_json(options = {})
    safe_options = options.is_a?(Hash) ? options : {}
    json = super(safe_options.except(:base_url))

    if safe_options[:base_url]
      json[:units] = units.map { |u| u.as_json(safe_options) }
    end

    json
  end

  def self.category_counts
    group(:category).count
  end

  private

  def ensure_no_units_have_reservations
    if units.joins(:reservations).exists?
      errors.add(:base, "Cannot delete accommodation because some units have active reservations.")
      throw(:abort)
    end
  end

  def strip_fields
    self.name = name&.strip
    self.address = address&.strip
  end

  def summarize_service(boolean_array)
    return "no access" if boolean_array.empty? || boolean_array.all?(false)
    return "full access" if boolean_array.all?(true)

    "partial access"
  end

  def summarize_water_quality
    qualities = units.map(&:water_before_type_cast)
    return "no access" if qualities.all?(0)

    return "full drinkable access" if qualities.all?(2)

    "partial access"
  end
end
