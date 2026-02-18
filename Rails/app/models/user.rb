class User < ApplicationRecord
  has_many :reservations, dependent: :destroy
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :orders

  validates :name, presence: true
  validates :phone_number, presence: true

  def staff?
    is_a?(Staff)
  end

  def client?
    is_a?(Client)
  end

  def admin?
    is_a?(Admin)
  end
end
