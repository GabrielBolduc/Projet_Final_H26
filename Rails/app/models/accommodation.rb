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
    includes(:festival, units: :reservations)
    .joins(:festival)
    .select("accommodations.*")
    .select(
      "ST_Distance_Sphere(
        POINT(accommodations.longitude, accommodations.latitude),
        POINT(festivals.longitude, festivals.latitude)
      ) / 1000 AS distance_from_festival_km"
    )
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
  valid_reservations = Reservation.where(unit_id: unit_ids, status: [:active, :completed])
  
  unit_prices = units.map(&:cost_person_per_night)
  parking_fees = units.map(&:parking_cost).select { |cost| cost > 0 }

  total_valid_bookings = valid_reservations.count
  total_people = valid_reservations.sum(:nb_of_people)

  total_revenue = units.sum do |unit|
    unit.reservations.where(status: [:active, :completed]).sum(:nb_of_people) * unit.cost_person_per_night
  end

  commission_multiplier = (100 - commission) / 100.0
  actual_profit = (total_revenue * commission_multiplier).round(2)

    {
      id: id,
      festival_id: festival_id,
      festival_name: festival.name,
      name: name,
      category: category_before_type_cast,
      unit_count: units.size,
      pricing: {
        avg_nightly_rate: unit_prices.any? ? (unit_prices.sum / unit_prices.size.to_f).round(2) : 0,
        avg_parking_fee: parking_fees.any? ? (parking_fees.sum / parking_fees.size.to_f).round(2) : 0
      },
      services: {
        water: summarize_water_quality,
        wifi: summarize_service(units.map(&:wifi)),
        electricity: summarize_service(units.map(&:electricity))
      },
      location: {
        address: address,
        distance_km: respond_to?(:distance_from_festival_km) ? distance_from_festival_km.to_f.round(2) : 0
      },
      reservation_stats: {
        total_count: total_valid_bookings,
        total_people: total_people,
        avg_people_per_booking: total_valid_bookings.positive? ? (total_people / total_valid_bookings.to_f).round(1) : 0
      },
      finance: {
        total_revenue: total_revenue.to_f.round(2),
        commission_rate: "#{commission}%",
        actual_profit: actual_profit
      },
      inventory: {
        total_reservations: total_valid_bookings,
        total_units: units.sum(:quantity)
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
