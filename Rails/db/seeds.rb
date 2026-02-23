# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
begin
  Affectation.destroy_all
rescue NameError, ActiveRecord::StatementInvalid
  # continue si aucune affectation
end

Reservation.destroy_all
Order.destroy_all
Ticket.destroy_all

Unit.destroy_all
Package.destroy_all

Accommodation.destroy_all
Unit.destroy_all
Reservation.destroy_all
Performance.destroy_all

Stage.destroy_all
Artist.destroy_all
Task.destroy_all

Festival.destroy_all
Client.destroy_all
Admin.destroy_all
Staff.destroy_all
User.destroy_all


c = Client.create!(
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

f = Festival.create!(
  name: "Festify 2026",
  start_at: Date.new(2026, 7, 15),
  end_at: Date.new(2026, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "ongoing",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f1 = Festival.create!(
  name: "Festify 2025",
  start_at: Date.new(2025, 7, 10),
  end_at: Date.new(2025, 7, 12),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "completed",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f2 = Festival.create!(
  name: "Festify 2024",
  start_at: Date.new(2024, 7, 15),
  end_at: Date.new(2024, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "completed",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

main_stage = Stage.create!(
    name: "Main stage",
    capacity: 15000,
    environment: "outdoor",
    technical_specs: "Big speaker"
)

b_stage = Stage.create!(
    name: "Secondary stage",
    capacity: 8000,
    environment: "indoor",
    technical_specs: "Medium stage"
)

c_stage = Stage.create!(
    name: "Small stage",
    capacity: 2000,
    environment: "covered",
    technical_specs: "Small speaker"
)


artist1 = Artist.create!(
    name: "Bob",
    genre: "Rock",
    popularity: 4,
    bio: "Good music"
)

artist2 = Artist.create!(
    name: "Louis",
    genre: "Hip hop",
    popularity: 3,
    bio: "Good music"
)

artist3 = Artist.create!(
    name: "Alice",
    genre: "Pop",
    popularity: 4,
    bio: "Good music"
)


Performance.create!(
  title: "First show",
  description: "Bon show.",
  price: 55.00,
  start_at: f.start_at.to_time.change(hour: 20, min: 0),
  end_at: f.start_at.to_time.change(hour: 22, min: 0),
  festival: f,
  stage: main_stage,
  artist: artist1
)

Performance.create!(
  title: "Second show",
  description: "Good show",
  price: 45.00,
  start_at: f.start_at.to_time.change(hour: 21, min: 0),
  end_at: f.start_at.to_time.change(hour: 23, min: 59),
  festival: f,
  stage: b_stage,
  artist: artist3
)

Performance.create!(
  title: "Last show",
  description: "Good show",
  price: 60.00,
  start_at: (f.start_at + 1.day).to_time.change(hour: 19, min: 0),
  end_at: (f.start_at + 1.day).to_time.change(hour: 20, min: 30),
  festival: f,
  stage: main_stage,
  artist: artist2
)

acc1 = Accommodation.create!(
  name: "Grand Royal Hotel",
  category: :hotel,
  address: "123 Festival Lane, Palm Springs, CA",
  latitude: 33.8121,
  longitude: -116.5165,
  shuttle: true,
  time_car: Time.parse("00:15:00"),
  time_walk: Time.parse("01:00:00"),
  commission: 12.50,
  festival: f
)

acc2 = Accommodation.create!(
  name: "Wildwood Luxury Camping",
  category: :camping,
  address: "North Gate, Sector B, Glastonbury",
  latitude: 51.1557,
  longitude: -2.5859,
  shuttle: false,
  time_car: Time.parse("00:05:00"),
  time_walk: Time.parse("00:10:00"),
  commission: 5.00,
  festival: f
)

unit1 = Unit.new(
  type: "SimpleRoom",
  accommodation: acc1,
  cost_person_per_night: 55.00,
  quantity: 10,
  wifi: true,
  water: 2 ,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)


# Packages (Billetterie)

p_general = Package.create!(
  title: "Passeport Festival",
  description: "Accès complet à toutes les scènes pour toute la durée du festival. Inclut un accès prioritaire.",
  price: 150.00,
  quota: 500,
  category: "general",
  valid_at: f.start_at,
  expired_at: f.end_at,
  festival: f
)

p_daily = Package.create!(
  title: "Billet Journalier",
  description: "Accès pour une seule journée de festivités.",
  price: 60.00,
  quota: 1000,
  category: "daily",
  valid_at: f.start_at.to_time.change(hour: 10),
  expired_at: f.start_at.to_time.change(hour: 17),
  festival: f
)

p_evening = Package.create!(
  title: "Billet Soirée",
  description: "Pour les spectacles du soir !",
  price: 72.99,
  quota: 2400,
  category: "evening",
  valid_at: f.start_at.to_time.change(hour: 19),
  expired_at: f.start_at.to_time.change(hour: 23),
  festival: f
)

# Attachement des images
images = {
  p_general => 'general-ticket.webp',
  p_daily   => 'daily-ticket.webp',
  p_evening => 'evening-ticket.jpg',
  unit1 => 'placeholder-image.jpg'
}

images.each do |package, filename|
  path = Rails.root.join('db', 'files', filename)
  
  if File.exist?(path)
    # Détermine le type d'image
    content_type = filename.end_with?('.jpg', '.jpeg') ? 'image/jpeg' : 'image/webp'

    package.image.attach(
      io: File.open(path),
      filename: filename,
      content_type: content_type 
    )
  else
    puts "Image non trouvée : #{filename}"
  end
end

unit1.save!

res1 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15),
  departure_at: Date.new(2026, 7, 17),
  nb_of_people: 1,
  reservation_name: "Jean Daniel",
  phone_number: "8195338888",
  user: c,
  unit: unit1,
  festival: f
)
