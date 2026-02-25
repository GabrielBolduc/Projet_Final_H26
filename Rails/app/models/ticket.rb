require "cgi"

class Ticket < ApplicationRecord
  belongs_to :order
  belongs_to :package
  has_one :festival, through: :package

  delegate :purchased_at, to: :order, allow_nil: true
  delegate :valid_at, :expired_at, to: :package, allow_nil: true

  validates :holder_name, presence: true, length: { maximum: 100 }
  validates :holder_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :holder_phone, presence: true, length: { maximum: 20 }, format: { with: /\A[0-9+\-() ]+\z/ }
  validates :unique_code, uniqueness: true

  before_validation :set_defaults, on: :create
  validate :check_package_quota, on: :create

  def generate_qr_code(size: 240)
    return nil if unique_code.blank?

    encoded_code = CGI.escape(unique_code)
    "https://api.qrserver.com/v1/create-qr-code/?size=#{size}x#{size}&data=#{encoded_code}"
  end

  def valid_at_scan?(scan_time)
    return false if refunded?
    return false if valid_at.blank? || expired_at.blank?

    parsed_scan_time = normalize_scan_time(scan_time)
    return false if parsed_scan_time.nil?

    parsed_scan_time.between?(valid_at, expired_at)
  end

  def valid_for_entry?
    valid_at_scan?(Time.current)
  end

  private

  def normalize_scan_time(scan_time)
    return scan_time.in_time_zone if scan_time.respond_to?(:in_time_zone)
    return Time.zone.parse(scan_time) if scan_time.is_a?(String)

    nil
  end

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
