# app/models/unit.rb
class Unit < ApplicationRecord
  belongs_to :accommodation
  has_many :reservations, dependent: :destroy
  has_one_attached :image

  CAPACITIES = {
    "Units::SimpleRoom"      => 1,
    "Units::DoubleRoom"      => 2,
    "Units::FamilyRoom"      => 6,
    "Units::SmallTerrain"    => 2,
    "Units::StandardTerrain" => 4,
    "Units::DeluxeTerrain"   => 8
  }.freeze

  enum :water, { no_water: 0, undrinkable: 1, drinkable: 2 }

  validates :quantity, numericality: { only_integer: true, greater_than: 0 }
  validates :cost_person_per_night, :parking_cost, numericality: { greater_than_or_equal_to: 0 }
  validates :image, presence: true
  validate :must_have_image


  def max_capacity
    CAPACITIES[self.type] || 0
  end

  def food_options_list
    food_options&.split(",") || []
  end

  def food_options_list=(values)
    self.food_options = Array(values).reject(&:blank?).join(",")
  end

  def as_json(options = {})
    super(options).merge({
      food_options: food_options_list,
      max_capacity: max_capacity
    })
  end

  def simple_room?
    is_a?(Units::SimpleRoom)
  end

  def double_room?
    is_a?(Units::DoubleRoom)
  end

  def family_room?
    is_a?(Units::FamilyRoom)
  end

  def small_terrain?
    is_a?(Units::SmallTerrain)
  end

  def standard_terrain?
    is_a?(Units::StandardTerrain)
  end

  def deluxe_terrain?
    is_a?(Units::DeluxeTerrain)
  end

  private

  def must_have_image
    unless image.attached?
      errors.add(:image, "must be uploaded")
    end
  end
end

