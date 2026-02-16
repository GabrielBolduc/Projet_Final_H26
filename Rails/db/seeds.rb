# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

User.destroy_all
Festival.destroy_all
Package.destroy_all
Ticket.destroy_all
Order.destroy_all

Client.create!(
    email: "client@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #1",
    phone_number: "555-555-5555"
)

Admin.create!(
    email: "admin@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Admin",
    phone_number: "222-222-2222"
)

Staff.create!(
    email: "staff@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Staff #1",
    phone_number: "666-666-6666",
    ability: "Gestion des réservations"
)

festival = Festival.create!(
  start_at:     DateTime.parse("2026-02-20"),
  end_at:       DateTime.parse("2026-02-27"),
  satisfaction:   5,
  comment:        "TEST",
  coordinates:    "POINT(-79.349 43.667)",
  other_income:   105256.89,
  other_expense:  40678.16,
  daily_capacity: 15000,
  address:        "001 main street",
  statut:         "ONGOING"
)

5.times do |i|
  Package.create!(
    title:        "Billet ##{i + 1}",
    description:  "Un billet de spectacle",
    category: "GENERAL",
    price:        75.0,
    quota:        1500,
    valid_at:   DateTime.parse("2026-02-20 10:00"),
    expired_at:  DateTime.parse("2026-02-20 22:00"),
    festival:     festival
  )
end
