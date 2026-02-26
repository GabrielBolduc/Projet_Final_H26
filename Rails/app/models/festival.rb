class Festival < ApplicationRecord
  has_many :performances, dependent: :destroy
  has_many :affectations, dependent: :destroy
  has_many :packages, dependent: :destroy
  has_many :accommodations, dependent: :destroy

  scope :recent, -> { order(start_at: :desc) }
  enum :status, { draft: "draft", ongoing: "ongoing",  completed: "completed" }, default: :draft, validate: true
  scope :filter_by_status, ->(status) { where(status: status) }
  scope :publicly_visible, -> { ongoing }

  before_destroy :prevent_destroy_if_ongoing

  validates :name, presence: true, length: { maximum: 100 }
  validates :start_at, :end_at, :status, :address, presence: true

  validates :daily_capacity, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :satisfaction, numericality: {  only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, allow_nil: true }

  validates :other_income, :other_expense, numericality: { allow_nil: true }

  validate :end_at_after_start_at
  validate :only_one_ongoing_festival

  composed_of :coordinates, class_name: "GeoPoint", mapping: [ %w[latitude latitude], %w[longitude longitude] ]


  private

  def end_at_after_start_at
    return if end_at.blank? || start_at.blank?

    if end_at < start_at
      errors.add(:end_at, "doit etre apres la date de debut")
    end
  end

  def only_one_ongoing_festival
    if ongoing? && Festival.ongoing.where.not(id: id).exists?
      errors.add(:status, "festival ongoing en cours")
    end
  end

  def prevent_destroy_if_ongoing
    if ongoing?
      errors.add(:base, "impossible de supprimer un festival ongoing")
      throw(:abort)
    end
  end
end
