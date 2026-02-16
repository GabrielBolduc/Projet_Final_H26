# app/models/unit.rb
class Unit < ApplicationRecord
  belongs_to :accommodation
  has_many :reservations
  has_many_attached :images

  CAPACITIES = {
    'SimpleRoom'      => 1,
    'DoubleRoom'      => 2,
    'FamilyRoom'      => 6,
    'SmallTerrain'    => 2,
    'StandardTerrain' => 4,
    'DeluxeTerrain'   => 8
  }.freeze

  enum :water, { no_water: 0, undrinkable: 1, drinkable: 2 }

  validates :quantity, numericality: { only_integer: true, greater_than: 0 }
  validates :cost_person_per_night, :parking_cost, numericality: { greater_than_or_equal_to: 0 }
  validates :images, presence: true
  validate :must_have_at_one_image


  def max_capacity
    CAPACITIES[self.type] || 0
  end

  def food_options_list
    food_options&.split(',') || []
  end

  def food_options_list=(values)
    self.food_options = Array(values).reject(&:blank?).join(',')
  end

  private

  def must_have_at_one_image
    unless images.attached?
      errors.add(:images, "must be uploaded (at least one image is required)")
    end
  end
end

class SimpleRoom < Unit; end
class DoubleRoom < Unit; end
class FamilyRoom < Unit; end
class SmallTerrain < Unit; end
class StandardTerrain < Unit; end
class DeluxeTerrain < Unit; end
