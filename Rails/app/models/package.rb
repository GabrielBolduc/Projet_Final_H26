class Package < ApplicationRecord
  belongs_to :festival
  has_many :tickets, dependent: :restrict_with_error

  enum :category, {
    general: 'GENERAL',
    daily: 'DAILY',
    evening: 'EVENING'
  }, default: :general, validate: true

  validates :title, presence: true
end