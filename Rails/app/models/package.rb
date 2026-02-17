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

  private

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