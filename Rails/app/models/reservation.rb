class Reservation < ApplicationRecord
  belongs_to :user
  belongs_to :unit
  belongs_to :festival

  attribute :status, :integer
  enum :status, { active: 0, cancelled: 1, completed: 2 }

  validates :arrival_at, :departure_at, :reservation_name, presence: true
  validates :nb_of_people, numericality: { only_integer: true, greater_than: 0 }
  validates :phone_number, presence: true

  validate :departure_must_be_after_arrival
  validate :capacity_within_limits
  validate :no_overlapping_bookings
  validate :dates_within_festival_window

  before_validation :strip_name

  before_save :normalize_phone

  def as_json(options = {})
    safe_options = options.is_a?(Hash) ? options : {}

    current_options = safe_options.except(:base_url)
    current_options[:include] ||= :festival

    json = super(current_options)

    if unit
      json[:unit] = unit.as_json(safe_options).merge({
        accommodation: unit.accommodation.as_json
      })
    end

    json
  end

  private


  def capacity_within_limits
    return unless unit && nb_of_people

    if nb_of_people > unit.max_capacity
      errors.add(:nb_of_people, "exceeds maximum capacity of #{unit.max_capacity} for a #{unit.type.titleize}")
    end
  end

  def no_overlapping_bookings
    return unless unit && arrival_at && departure_at

    overlaps = Reservation.active
                          .where(unit_id: unit_id)
                          .where.not(id: id)
                          .where("DATE(arrival_at) < ? AND DATE(departure_at) > ?", departure_at.to_date, arrival_at.to_date)

    if overlaps.exists?
      Rails.logger.debug "CONFLICT FOUND: #{overlaps.first.inspect}"
      errors.add(:base, "This unit is already booked for the selected dates.")
    end
  end

  def dates_within_festival_window
    return unless festival && arrival_at && departure_at

    if arrival_at < festival.start_at - 3.days
      errors.add(:arrival_at, "cannot be more than 3 days before the festival starts")
    end

    if departure_at > festival.end_at + 3.days
      errors.add(:departure_at, "cannot be more than 3 days after the festival ends")
    end
  end

  def departure_must_be_after_arrival
    return if arrival_at.blank? || departure_at.blank?
    errors.add(:departure_at, "must be after the arrival date") if departure_at <= arrival_at
  end

  def strip_name
    self.reservation_name = reservation_name&.strip
  end

  def normalize_phone
    if phone_number.present?
      parsed = Phonelib.parse(phone_number)
      if parsed.valid?
        self.phone_number = parsed.national.gsub(/\D/, "")
      end
    end
  end
end
