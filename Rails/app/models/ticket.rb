class Ticket < ApplicationRecord
  belongs_to :order
  belongs_to :package
  has_one :festival, through: :package

  delegate :purchased_at, to: :order, allow_nil: true

  validates :holder_name, presence: true, length: { maximum: 100 }
  validates :holder_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :holder_phone, presence: true, length: { maximum: 20 }, format: { with: /\A[0-9+\-() ]+\z/ }
  validates :unique_code, uniqueness: true

  before_validation :set_defaults, on: :create
  validate :check_package_quota, on: :create

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

    active_ticket_count = package.tickets.where(refunded: false).count
    if active_ticket_count >= package.quota
      errors.add(:base, "Le quota pour ce forfait est atteint (Sold Out).")
    end
  end
end
