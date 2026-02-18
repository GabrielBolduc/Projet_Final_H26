class Staff < User
    validates :ability, presence: true

   has_many :affectations, foreign_key: :user_id, dependent: :destroy
end