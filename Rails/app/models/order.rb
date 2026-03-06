class Order < ApplicationRecord
  belongs_to :user
  has_many :tickets, dependent: :destroy

  validates :user, presence: true

  def subtotal
    tickets.sum(:price)
  end

  def total_price
    [ subtotal - discount, 0 ].max
  end
end
