class Festival < ApplicationRecord
  enum :statut, { 
    draft: 'DRAFT', 
    ongoing: 'ONGOING', 
    completed: 'COMPLETED' 
  }, default: :draft, validate: true

  validates :start_at, :end_at, :coordinates, :daily_capacity, :address, :statut, presence: true

  validates :address, length: { maximum: 250 }
  validates :daily_capacity, numericality: { only_integer: true, greater_than: 0 }
  
  validates :satisfaction, numericality: { 
    only_integer: true, 
    greater_than_or_equal_to: 0, 
    less_than_or_equal_to: 5, 
    allow_nil: true 
  }

  validates :other_income, :other_expense, numericality: { allow_nil: true }

  validate :end_at_after_start_at

  private

  def end_at_after_start_at
    return if end_at.blank? || start_at.blank?

    if end_at < start_at
      errors.add(:end_at, "doit être postérieure ou égale à la date de début")
    end
  end
end