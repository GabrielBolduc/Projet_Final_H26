
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

  ALLOWED_FOOD = ["None", "Canteen", "Room service", "Restaurant"].freeze

  enum :water, { no_water: 0, undrinkable: 1, drinkable: 2 }, prefix: true

  validates :quantity, numericality: { only_integer: true, greater_than: 0 }
  validates :cost_person_per_night, :parking_cost, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 100 }
  validates :image, presence: true
  validate :must_have_image
  validate :type_matches_accommodation_category
  validate :validate_food_options


  def max_capacity
    CAPACITIES[self.type] || 0
  end

  def food_options_as_array
    read_attribute(:food_options)&.split(",") || []
  end

  def food_options=(values)
    if values.is_a?(Array)
      str_value = values.reject(&:blank?).join(",")
      write_attribute(:food_options, str_value)
    else
      super(values)
    end
  end

  def as_json(options = {})
    super(options).merge({
      type: self.type,
      food_options: food_options_as_array,
      max_capacity: max_capacity,
      water: self.water
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

  def type_matches_accommodation_category
    if accommodation.hotel? && type.start_with?('Units::SmallTerrain', 'Units::StandardTerrain', 'Units::DeluxeTerrain')
      errors.add(:type, "cannot be a terrain for a hotel")
    elsif accommodation.camping? && type.start_with?('Units::SimpleRoom', 'Units::DoubleRoom', 'Units::FamilyRoom')
      errors.add(:type, "cannot be a room for a camping site")
    end
  end

  def validate_food_options
    # Ensure every selected option exists in the ALLOWED_FOOD list
    invalid = food_options_as_array - ALLOWED_FOOD
    if invalid.any?
      errors.add(:food_options, "contains invalid values: #{invalid.join(', ')}")
    end
  end
end

