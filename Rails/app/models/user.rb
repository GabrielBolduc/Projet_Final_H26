class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
  validates :name, presence: true
  validates :role, presence: true
  validates :phone_number, presence: true

  # role par default
  after_initialize :set_default_role, if: :new_record?
  # sync role et type (sti)
  before_validation :set_type_from_role

  before_save :sync_role_from_type

  private

  def set_default_role
    self.role ||= 'CLIENT'
  end

  def set_type_from_role
    if role.present?
      self.type ||= role.to_s.capitalize
    end
  end

  def sync_role_from_type
    self.role = type.to_s.upcase if type.present?
  end
end
