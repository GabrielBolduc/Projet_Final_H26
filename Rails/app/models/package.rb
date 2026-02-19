class Package < ApplicationRecord
  belongs_to :festival
  has_many :tickets, dependent: :restrict_with_error

  # ACTIVESTORAGE
  has_one_attached :image

  enum :category, {
    general: 'GENERAL',
    daily: 'DAILY',
    evening: 'EVENING'
  }, default: :general, validate: true

  validates :title, presence: true, length: { maximum: 100 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quota, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :valid_at, :expired_at, presence: true

  validate :expired_date_after_valid_date
  validate :image_format_validation
  validate :quota_cannot_exceed_daily_capacity
  validate :validity_must_be_within_festival_dates

  private

  def validity_must_be_within_festival_dates
    return unless festival && valid_at && expired_at

    # 1. On convertit la date de DÉBUT du festival en "Début de journée" (00:00:00)
    festival_start_limit = festival.start_at.beginning_of_day

    # 2. On convertit la date de FIN du festival en "Fin de journée" (23:59:59.999)
    festival_end_limit = festival.end_at.end_of_day

    # 3. Validation
    if valid_at < festival_start_limit
      errors.add(:valid_at, "ne peut pas être avant le début du festival (#{festival.start_at})")
    end

    if expired_at > festival_end_limit
      errors.add(:expired_at, "ne peut pas être après la fin du festival (#{festival.end_at})")
    end
  end

  def quota_cannot_exceed_daily_capacity
    return unless festival && quota
    if quota > festival.daily_capacity
      errors.add(:quota, "ne peut pas dépasser la capacité journalière du festival (#{festival.daily_capacity})")
    end
  end

  # Validation du format d'image (JPEG, PNG, WEBP)
  def image_format_validation
    return unless image.attached?

    # formats acceptés
    acceptable_types = ["image/jpeg", "image/png", "image/webp"]
    
    unless acceptable_types.include?(image.content_type)
      errors.add(:image, "doit être au format JPEG, PNG ou WEBP")
    end
    
    # Validation de la taille (ex: Max 5MB)
    if image.byte_size > 5.megabytes
      errors.add(:image, "est trop volumineuse (max 5MB)")
    end
  end

  def expired_date_after_valid_date
    return if valid_at.blank? || expired_at.blank?

    if expired_at < valid_at
      errors.add(:expired_at, "doit être ultérieure à la date de début")
    end
  end
end