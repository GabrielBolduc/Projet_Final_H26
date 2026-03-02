class Accommodation < ApplicationRecord
  belongs_to :festival
  has_many :units, dependent: :destroy

  enum :category, { camping: 0, hotel: 1 }

  validates :name, presence: true, length: { maximum: 100 }
  validates :address, presence: true
  validates :commission, numericality: { greater_than_or_equal_to: 0, less_than: 30 }
  validates :latitude, :longitude, presence: true
  validates :time_car, :time_walk, presence: true

  scope :search_by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
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
    joins(:units).merge(
      Unit.all.then { |u|
        u = u.has_wifi(true) if p[:wifi] == 'true'
        u = u.has_electricity(true) if p[:electricity] == 'true'
        u = u.with_water_quality(p[:water]) if p[:water].present?
        u = u.with_min_capacity(p[:min_people]) if p[:min_people].present?
        u = u.price_under(p[:max_price]) if p[:max_price].present?
        u
      }
    ).distinct
  }

  before_validation :strip_fields

  private

  def strip_fields
    self.name = name&.strip
    self.address = address&.strip
  end
end