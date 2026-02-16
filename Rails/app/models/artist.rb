class Artist < ApplicationRecord
    has_one_attached :image
    
    has_many :performances, dependent: :restrict_with_error

    validates :name, presence: true, length: { maximum: 100 }, uniqueness: true
    validates :genre, presence: true, length: { maximum: 50 }
    validates :popularity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
end
