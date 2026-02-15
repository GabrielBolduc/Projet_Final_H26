class Performance < ApplicationRecord
  belongs_to :artist
  belongs_to :stage
  belongs_to :festival
  
  validates :start_at, :end_at, :price, presence: true
  validates :title, length: { maximum: 20 }
  validates :price, numericality: { greater_than_or_equal_to: 0 }
end
