class Staff < User
    validates :ability, presence: true

    has_one :affectation, dependent: :destroy
end