class Order < ApplicationRecord
  belongs_to :user
  has_many :tickets, dependent: :destroy

  validates :user, presence: true
end