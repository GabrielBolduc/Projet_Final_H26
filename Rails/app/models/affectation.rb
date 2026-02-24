class Affectation < ApplicationRecord
  belongs_to :festival
  belongs_to :task
  belongs_to :user

  validates :expected_start, :expected_end, :responsability, presence: true


  validate :expected_end_after_expected_start

   private

  def expected_end_after_expected_start
    return if expected_end.blank? || expected_start.blank?

    if expected_end < expected_start
      errors.add(:expected_end, "doit etre apres la date de debut")
    end
  end


  
end
