class Staff < User
    validates :ability, presence: true

    has_many :affectations, dependent: :destroy
end