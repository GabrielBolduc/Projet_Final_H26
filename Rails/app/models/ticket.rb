class Ticket < ApplicationRecord
  belongs_to :order
  belongs_to :package
  has_one :festival, through: :package

  delegate :purchased_at, to: :order, allow_nil: true

  validates :holder_name, presence: true, length: { maximum: 100 }
  validates :holder_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :unique_code, uniqueness: true

  before_validation :set_defaults, on: :create
  validate :check_package_quota, on: :create
  validate :check_festival_capacity, on: :create

  def valid_for_entry?
    return false if refunded?
    current_time = Time.current
    current_time >= package.valid_at && current_time <= package.expired_at
  end

  private

  def set_defaults
    self.price ||= package&.price
    self.unique_code ||= SecureRandom.uuid
  end

  def check_package_quota
    return unless package
    if package.tickets.count >= package.quota
      errors.add(:base, "Le quota pour ce forfait est atteint (Sold Out).")
    end
  end

  def check_festival_capacity
    return unless package
    total_tickets_sold = Ticket.joins(:package).where(packages: { festival_id: package.festival_id }).count

    if total_tickets_sold >= package.festival.daily_capacity
      errors.add(:base, "La capacité maximale du festival est atteinte.")
    end
  end
end