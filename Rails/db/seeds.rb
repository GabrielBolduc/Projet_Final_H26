# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
ActiveRecord::Base.connection.execute("SET FOREIGN_KEY_CHECKS = 0;")

begin
  Affectation.delete_all
  Reservation.delete_all
  Order.delete_all
  Ticket.delete_all
  Package.delete_all
  Unit.delete_all
  Accommodation.delete_all
  Performance.delete_all
  Stage.delete_all
  Task.delete_all
  Artist.delete_all
  Festival.delete_all
  Client.delete_all
  Admin.delete_all
  Staff.delete_all
  User.delete_all
ensure
  ActiveRecord::Base.connection.execute("SET FOREIGN_KEY_CHECKS = 1;")
end


c = Client.create!(
    email: "client@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #1",
    phone_number: "555-555-5555"
)

c2 = Client.create!(
    email: "client2@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #2",
    phone_number: "555-555-2222"
)

c3 = Client.create!(
    email: "client3@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #3",
    phone_number: "555-555-3333"
)

c4 = Client.create!(
    email: "client4@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #4",
    phone_number: "555-555-4444"
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
    ability: "securité"
)

Staff.create!(
    email: "staff2@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Staff #2",
    phone_number: "666-666-6666",
    ability: "Gestion des réservations"
)

Staff.create!(
    email: "staff3@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Staff #3",
    phone_number: "666-666-6666",
    ability: "cuisine"
)
# GabrielB
f = Festival.create!(
  name: "Festify 2026",
  start_at: Date.new(2026, 7, 15),
  end_at: Date.new(2026, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.577793,
  longitude: -72.710997,
  status: "ongoing",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Un gros festival"
)

f1 = Festival.create!(
  name: "Festify 2027",
  start_at: Date.new(2027, 7, 10),
  end_at: Date.new(2027, 7, 12),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "draft",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f2 = Festival.create!(
  name: "Festify 2025",
  start_at: Date.new(2026, 9, 15),
  end_at: Date.new(2026, 9, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "draft",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f3 = Festival.create!(
  name: "Festify winter",
  start_at: Date.new(2026, 12, 20),
  end_at: Date.new(2026, 12, 31),
  daily_capacity: 6000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.577793,
  longitude: -72.710997,
  status: "draft",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival d'hiver"
)

f4 = Festival.create!(
  name: "Festify Fall",
  start_at: Date.new(2026, 10, 30),
  end_at: Date.new(2026, 10, 31),
  daily_capacity: 6000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.559249,
  longitude: -72.736864,
  status: "draft",
  satisfaction: 4,
  other_income: 25000.00,
  other_expense: 6000.00,
  comment: "Bon festival d'authomne"
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
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin magna risus, laoreet imperdiet porttitor in, pulvinar at nibh. Nulla at vulputate enim. Etiam vehicula ligula nec mi euismod imperdiet. Maecenas nulla dolor, egestas eu bibendum eget, sollicitudin eget neque. Nulla facilisi. Ut eu lacus ipsum. Vivamus sit amet dolor justo. Cras a arcu id orci lacinia efficitur eget vehicula libero. Nulla facilisi. Sed eget facilisis eros. Nunc vehicula egestas elit, ut bibendum magna facilisis eget.  "
)
artist1.reload

artist1.image.attach(
  io: File.open(Rails.root.join('db/files/artist1.jpg')),
  filename: 'artist1.jpg',
  content_type: 'image/jpeg'
)

artist2 = Artist.create!(
  name: "Louis",
  genre: "Hip hop",
  popularity: 3,
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin magna risus, laoreet imperdiet porttitor in, pulvinar at nibh. Nulla at vulputate enim. Etiam vehicula ligula nec mi euismod imperdiet. Maecenas nulla dolor, egestas eu bibendum eget, sollicitudin eget neque. Nulla facilisi. Ut eu lacus ipsum. Vivamus sit amet dolor justo. Cras a arcu id orci lacinia efficitur eget vehicula libero. Nulla facilisi. Sed eget facilisis eros. Nunc vehicula egestas elit, ut bibendum magna facilisis eget.  "
)
artist2.image.attach(
  io: File.open(Rails.root.join('db/files/artist2.jpg')),
  filename: 'artist2.jpg',
  content_type: 'image/jpeg'
)

artist3 = Artist.create!(
  name: "Alice",
  genre: "Pop",
  popularity: 4,
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin magna risus, laoreet imperdiet porttitor in, pulvinar at nibh. Nulla at vulputate enim. Etiam vehicula ligula nec mi euismod imperdiet. Maecenas nulla dolor, egestas eu bibendum eget, sollicitudin eget neque. Nulla facilisi. Ut eu lacus ipsum. Vivamus sit amet dolor justo. Cras a arcu id orci lacinia efficitur eget vehicula libero. Nulla facilisi. Sed eget facilisis eros. Nunc vehicula egestas elit, ut bibendum magna facilisis eget.  "
)
artist3.image.attach(
  io: File.open(Rails.root.join('db/files/artist3.jpg')),
  filename: 'artist3.jpg',
  content_type: 'image/jpeg'
)

artist4 = Artist.create!(
  name: "Jean",
  genre: "Blues",
  popularity: 2,
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin magna risus, laoreet imperdiet porttitor in, pulvinar at nibh. Nulla at vulputate enim. Etiam vehicula ligula nec mi euismod imperdiet. Maecenas nulla dolor, egestas eu bibendum eget, sollicitudin eget neque. Nulla facilisi. Ut eu lacus ipsum. Vivamus sit amet dolor justo. Cras a arcu id orci lacinia efficitur eget vehicula libero. Nulla facilisi. Sed eget facilisis eros. Nunc vehicula egestas elit, ut bibendum magna facilisis eget. "
)

artist4.image.attach(
  io: File.open(Rails.root.join('db/files/artist4.webp')),
  filename: 'artist4.webp',
  content_type: 'image/webp'
)


# perf pour f (ongoing)
Performance.create!(
  title: "First show",
  description: "Le premier show",
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

Performance.create!(
  title: "Le show de jean",
  description: "Good show",
  price: 5000.00,
  start_at: (f.start_at + 4.day).to_time.change(hour: 16, min: 0),
  end_at: (f.start_at + 4.day).to_time.change(hour: 18, min: 0),
  festival: f,
  stage: c_stage,
  artist: artist4
)

# perf pour f1 (draft)
Performance.create!(
  title: "First show",
  description: "DRAFT - Bon show",
  price: 55.00,
  start_at: f1.start_at.to_time.change(hour: 20, min: 0),
  end_at: f1.start_at.to_time.change(hour: 22, min: 0),
  festival: f1,
  stage: main_stage,
  artist: artist1
)

Performance.create!(
  title: "Second show",
  description: "DRAFT - Good show",
  price: 45.00,
  start_at: f1.start_at.to_time.change(hour: 21, min: 0),
  end_at: f1.start_at.to_time.change(hour: 23, min: 59),
  festival: f1,
  stage: b_stage,
  artist: artist3
)

Performance.create!(
  title: "Last show",
  description: "DRAFT - Good show",
  price: 60.00,
  start_at: (f1.start_at + 1.day).to_time.change(hour: 19, min: 0),
  end_at: (f1.start_at + 1.day).to_time.change(hour: 20, min: 30),
  festival: f1,
  stage: main_stage,
  artist: artist2
)

# perf pour f2 (completed)
Performance.create!(
  title: "First show",
  description: "un show de musique",
  price: 55.00,
  start_at: f2.start_at.to_time.change(hour: 20, min: 0),
  end_at: f2.start_at.to_time.change(hour: 22, min: 0),
  festival: f2,
  stage: main_stage,
  artist: artist1
)

Performance.create!(
  title: "Second show",
  description: "un show",
  price: 45.00,
  start_at: f2.start_at.to_time.change(hour: 21, min: 0),
  end_at: f2.start_at.to_time.change(hour: 23, min: 59),
  festival: f2,
  stage: b_stage,
  artist: artist3
)

Performance.create!(
  title: "Last show",
  description: "not a good show",
  price: 60.00,
  start_at: (f2.start_at + 1.day).to_time.change(hour: 19, min: 0),
  end_at: (f2.start_at + 1.day).to_time.change(hour: 20, min: 30),
  festival: f2,
  stage: main_stage,
  artist: artist2
)

# perf pour f3 (completed)
Performance.create!(
  title: "First Winter Show",
  description: "Un show dehors",
  price: 1500.00,
  start_at: f3.start_at.to_time.change(hour: 20, min: 0),
  end_at: f3.start_at.to_time.change(hour: 22, min: 0),
  festival: f3,
  stage: b_stage,
  artist: artist2
)

Performance.create!(
  title: "Winter Show",
  description: "Un show",
  price: 14000,
  start_at: (f3.start_at + 1.day).to_time.change(hour: 19, min: 0),
  end_at: (f3.start_at + 1.day).to_time.change(hour: 20, min: 30),
  festival: f3,
  stage: b_stage,
  artist: artist4
)

Performance.create!(
  title: "Last Winter Show",
  description: "Un dernier show show",
  price: 14000,
  start_at: (f3.start_at + 2.day).to_time.change(hour: 19, min: 0),
  end_at: (f3.start_at + 2.day).to_time.change(hour: 20, min: 30),
  festival: f3,
  stage: b_stage,
  artist: artist1
)

# perf pour f4 (completed)
Performance.create!(
  title: "First Fall Show",
  description: "Un show couvert",
  price: 1500.00,
  start_at: f4.start_at.to_time.change(hour: 16, min: 0),
  end_at: f4.start_at.to_time.change(hour: 19, min: 0),
  festival: f4,
  stage: c_stage,
  artist: artist1
)

Performance.create!(
  title: "Nice Fall Show",
  description: "Un show couvert",
  price: 1500.00,
  start_at: f4.start_at.to_time.change(hour: 20, min: 0),
  end_at: f4.start_at.to_time.change(hour: 22, min: 0),
  festival: f4,
  stage: c_stage,
  artist: artist2
)

Performance.create!(
  title: "Big Fall Show",
  description: "Un show",
  price: 14000,
  start_at: (f4.start_at + 1.day).to_time.change(hour: 18, min: 0),
  end_at: (f4.start_at + 1.day).to_time.change(hour: 20, min: 0),
  festival: f4,
  stage: c_stage,
  artist: artist3
)

Performance.create!(
  title: "Last Fall Show",
  description: "Un show",
  price: 14000,
  start_at: (f4.start_at + 1.day).to_time.change(hour: 21, min: 0),
  end_at: (f4.start_at + 1.day).to_time.change(hour: 23, min: 30),
  festival: f4,
  stage: c_stage,
  artist: artist4
)

f2.update!(status: "completed", start_at: Date.new(2025, 7, 15), end_at: Date.new(2025, 7, 20))
f2.reload

f3.update!(status: "completed", start_at: Date.new(2025, 12, 20), end_at: Date.new(2025, 12, 31))
f3.reload

f4.update!(status: "completed", start_at: Date.new(2024, 10, 30), end_at: Date.new(2024, 10, 31))
f4.reload

# Alexandre
## Alexandre 1
# Accommodations festival actuel.
acc1 = Accommodation.create!(
  name: "Grand Royal Hotel",
  category: :hotel,
  address: "123 Festival Lane, Palm Springs, CA",
  latitude: 46.56571486688975,
  longitude: -72.72712896089062,
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
  latitude: 46.52391224860748,
  longitude: -72.32665159829943,
  shuttle: false,
  time_car: Time.parse("00:05:00"),
  time_walk: Time.parse("00:10:00"),
  commission: 5.00,
  festival: f
)

acc3 = Accommodation.create!(
  name: "Starlight Hostel",
  category: :hotel,
  address: "45 Economy St, Downtown",
  latitude: 46.5400,
  longitude: -72.7400,
  shuttle: false,
  time_car: Time.parse("00:10:00"),
  time_walk: Time.parse("00:45:00"),
  commission: 25.00,
  festival: f
)

acc4 = Accommodation.create!(
  name: "The Front Row Fields",
  category: :camping,
  address: "Zero Mile Marker, Glastonbury",
  latitude: 46.5250,
  longitude: -72.3300,
  shuttle: false,
  time_car: Time.parse("00:02:00"),
  time_walk: Time.parse("00:05:00"),
  commission: 2.50,
  festival: f
)


# Accommodation festival passe

acc1old = Accommodation.create!(
  name: "Grand Royal Hotel - old",
  category: :hotel,
  address: "123 Festival Lane, Palm Springs, CA",
  latitude: 46.56571486688975,
  longitude: -72.72712896089062,
  shuttle: true,
  time_car: Time.parse("00:15:00"),
  time_walk: Time.parse("01:00:00"),
  commission: 12.50,
  festival: f2
)

acc2old = Accommodation.create!(
  name: "Wildwood Luxury Camping - old",
  category: :camping,
  address: "North Gate, Sector B, Glastonbury",
  latitude: 46.52391224860748,
  longitude: -72.32665159829943,
  shuttle: false,
  time_car: Time.parse("00:05:00"),
  time_walk: Time.parse("00:10:00"),
  commission: 5.00,
  festival: f2
)

acc3old = Accommodation.create!(
  name: "Starlight Hostel - old",
  category: :hotel,
  address: "45 Economy St, Downtown",
  latitude: 46.5400,
  longitude: -72.7400,
  shuttle: false,
  time_car: Time.parse("00:10:00"),
  time_walk: Time.parse("00:45:00"),
  commission: 25.00,
  festival: f2
)

acc4old = Accommodation.create!(
  name: "The Front Row Fields - old",
  category: :camping,
  address: "Zero Mile Marker, Glastonbury",
  latitude: 46.5250,
  longitude: -72.3300,
  shuttle: false,
  time_car: Time.parse("00:02:00"),
  time_walk: Time.parse("00:05:00"),
  commission: 2.50,
  festival: f2
)


# Unite festival actuel
unit1 = Units::SimpleRoom.new(
  accommodation: acc1,
  cost_person_per_night: 55.00,
  quantity: 10,
  wifi: true,
  water: 2,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)

unit_hotel_mid = Units::DoubleRoom.new(
  accommodation: acc1,
  cost_person_per_night: 85.00,
  quantity: 12,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 10.00,
  food_options: "Restaurant"
)

unit_hotel_high = Units::FamilyRoom.new(
  accommodation: acc1,
  cost_person_per_night: 150.00,
  quantity: 5,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)

unit_camp_low = Units::SmallTerrain.new(
  accommodation: acc2,
  cost_person_per_night: 25.00,
  quantity: 30,
  wifi: false,
  water: :no_water,
  electricity: false,
  parking_cost: 5.00,
  food_options: "None"
)

unit_camp_high = Units::DeluxeTerrain.new(
  accommodation: acc2,
  cost_person_per_night: 75.00,
  quantity: 10,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Canteen"
)

unit_hotel_basic = Units::SimpleRoom.new(
  accommodation: acc3,
  cost_person_per_night: 35.00,
  quantity: 20,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 5.00,
  food_options: "Canteen"
)

unit_hotel_double = Units::DoubleRoom.new(
  accommodation: acc3,
  cost_person_per_night: 60.00,
  quantity: 8,
  wifi: false,
  water: :drinkable,
  electricity: true,
  parking_cost: 5.00,
  food_options: "Canteen"
)

unit_camp_standard = Units::StandardTerrain.new(
  accommodation: acc4,
  cost_person_per_night: 40.00,
  quantity: 25,
  wifi: false,
  water: :undrinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "None"
)

unit_camp_premium = Units::DeluxeTerrain.new(
  accommodation: acc4,
  cost_person_per_night: 110.00,
  quantity: 4,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 10.00,
  food_options: "Restaurant"
)

# Unite festival passe

unit1old = Units::SimpleRoom.new(
  accommodation: acc1old,
  cost_person_per_night: 55.00,
  quantity: 10,
  wifi: true,
  water: 2,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)

unit_hotel_mid_old = Units::DoubleRoom.new(
  accommodation: acc1old,
  cost_person_per_night: 85.00,
  quantity: 12,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 10.00,
  food_options: "Restaurant"
)

unit_hotel_high_old = Units::FamilyRoom.new(
  accommodation: acc1old,
  cost_person_per_night: 150.00,
  quantity: 5,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)

unit_camp_low_old = Units::SmallTerrain.new(
  accommodation: acc2old,
  cost_person_per_night: 25.00,
  quantity: 30,
  wifi: false,
  water: :no_water,
  electricity: false,
  parking_cost: 5.00,
  food_options: "None"
)

unit_camp_high_old = Units::DeluxeTerrain.new(
  accommodation: acc2old,
  cost_person_per_night: 75.00,
  quantity: 10,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Canteen"
)

unit_hotel_basic_old = Units::SimpleRoom.new(
  accommodation: acc3old,
  cost_person_per_night: 35.00,
  quantity: 20,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 5.00,
  food_options: "Canteen"
)

unit_hotel_double_old = Units::DoubleRoom.new(
  accommodation: acc3old,
  cost_person_per_night: 60.00,
  quantity: 8,
  wifi: false,
  water: :drinkable,
  electricity: true,
  parking_cost: 5.00,
  food_options: "Canteen"
)

unit_camp_standard_old = Units::StandardTerrain.new(
  accommodation: acc4old,
  cost_person_per_night: 40.00,
  quantity: 25,
  wifi: false,
  water: :undrinkable,
  electricity: true,
  parking_cost: 0.00,
  food_options: "None"
)

unit_camp_premium_old = Units::DeluxeTerrain.new(
  accommodation: acc4old,
  cost_person_per_night: 110.00,
  quantity: 4,
  wifi: true,
  water: :drinkable,
  electricity: true,
  parking_cost: 10.00,
  food_options: "Restaurant"
)


# Racine

p_general = Package.create!(
  title: "Passeport Festival (Sold Out)",
  description: "Accès complet à toutes les scènes pour toute la durée du festival. Inclut un accès prioritaire.",
  price: 150.00,
  quota: 4,
  category: "general",
  valid_at: f.start_at.beginning_of_day,
  expired_at: f.end_at.end_of_day,
  festival: f
)

p_daily = Package.create!(
  title: "Billet Journalier",
  description: "Accès pour une seule journée de festivités.",
  price: 60.00,
  quota: 6,
  category: "daily",
  valid_at: f.start_at.in_time_zone('America/New_York').change(hour: 10, min: 0),
  expired_at: f.start_at.in_time_zone('America/New_York').change(hour: 17, min: 0),
  discount_min_quantity: 3,
  discount_rate: 0.10,
  festival: f
)

p_evening = Package.create!(
  title: "Billet Soirée (Aucune vente)",
  description: "Pour les spectacles du soir !",
  price: 72.99,
  quota: 5,
  category: "evening",
  valid_at: (f.start_at + 1.day).in_time_zone('America/New_York').change(hour: 19, min: 0),
  expired_at: (f.start_at + 1.day).in_time_zone('America/New_York').change(hour: 23, min: 0),
  festival: f
)

p_daily_sold_out = Package.create!(
  title: "Billet Journalier (Complet)",
  description: "Forfait journalier utilisé pour tester le statut sold out.",
  price: 55.00,
  quota: 2,
  category: "daily",
  valid_at: f.start_at.in_time_zone('America/New_York').change(hour: 10, min: 0),
  expired_at: f.start_at.in_time_zone('America/New_York').change(hour: 17, min: 0),
  festival: f
)

p_evening_last_spots = Package.create!(
  title: "Billet Soirée (Dernières places)",
  description: "Forfait presque complet pour valider les derniers billets.",
  price: 79.99,
  quota: 3,
  category: "evening",
  valid_at: (f.start_at + 1.day).in_time_zone('America/New_York').change(hour: 19, min: 0),
  expired_at: (f.start_at + 1.day).in_time_zone('America/New_York').change(hour: 23, min: 0),
  festival: f
)

p_daily_day2 = Package.create!(
  title: "Billet Journalier - Jour 2",
  description: "Accès à la deuxième journée du festival.",
  price: 64.99,
  quota: 8,
  category: "daily",
  valid_at: (f.start_at + 2.days).in_time_zone('America/New_York').change(hour: 10, min: 0),
  expired_at: (f.start_at + 2.days).in_time_zone('America/New_York').change(hour: 17, min: 0),
  festival: f
)

p_evening_overnight = Package.create!(
  title: "Billet Soirée (Nuit Blanche)",
  description: "Accès du soir jusqu'à la nuit (jusqu'à 02:00).",
  price: 89.99,
  quota: 4,
  category: "evening",
  valid_at: (f.start_at + 2.days).in_time_zone('America/New_York').change(hour: 21, min: 0),
  expired_at: (f.start_at + 3.days).in_time_zone('America/New_York').change(hour: 2, min: 0),
  festival: f
)

p_general_flex = Package.create!(
  title: "Passeport Festival Flex",
  description: "Passeport général avec quota plus élevé pour tests de volume.",
  price: 175.00,
  quota: 10,
  category: "general",
  valid_at: f.start_at.beginning_of_day,
  expired_at: f.end_at.end_of_day,
  festival: f
)

p_completed = Package.create!(
  title: "Passeport Archive",
  description: "Forfait d'un festival terminé pour valider l'affichage des archives.",
  price: 130.00,
  quota: 3,
  category: "general",
  valid_at: f2.start_at.beginning_of_day,
  expired_at: f2.end_at.end_of_day,
  festival: f2
)

# Orders + Tickets (Billetterie)
order_general_1 = Order.create!(user: c, purchased_at: f.start_at.to_time.change(hour: 9, min: 15))
order_general_2 = Order.create!(user: c2, purchased_at: f.start_at.to_time.change(hour: 9, min: 45))
order_daily_1 = Order.create!(user: c, purchased_at: f.start_at.to_time.change(hour: 10, min: 30), discount: (60.00 * 3 * 0.10).round(2))
order_daily_2 = Order.create!(user: c3, purchased_at: f.start_at.to_time.change(hour: 11, min: 15))
order_daily_sold_out_1 = Order.create!(user: c2, purchased_at: (f.start_at + 1.day).to_time.change(hour: 10, min: 5))
order_daily_sold_out_2 = Order.create!(user: c3, purchased_at: (f.start_at + 1.day).to_time.change(hour: 10, min: 20))
order_evening_last_spots = Order.create!(user: c, purchased_at: (f.start_at + 1.day).to_time.change(hour: 19, min: 10))
order_daily_day2_1 = Order.create!(user: c2, purchased_at: (f.start_at + 2.days).to_time.change(hour: 9, min: 50))
order_daily_day2_2 = Order.create!(user: c3, purchased_at: (f.start_at + 2.days).to_time.change(hour: 10, min: 25))
order_evening_overnight = Order.create!(user: c, purchased_at: (f.start_at + 2.days).to_time.change(hour: 20, min: 55))
order_general_flex_1 = Order.create!(user: c, purchased_at: f.start_at.to_time.change(hour: 8, min: 40))
order_general_flex_2 = Order.create!(user: c2, purchased_at: (f.start_at + 1.day).to_time.change(hour: 9, min: 5))
order_completed = Order.create!(user: c, purchased_at: f2.start_at.to_time.change(hour: 12, min: 0))

ticket_seq = 0

create_tickets = lambda do |order:, package:, quantity:, refunded_indexes: [], holder_prefix: "Billet"|
  quantity.times do |index|
    ticket_seq += 1
    is_refunded = refunded_indexes.include?(index)

    Ticket.create!(
      order: order,
      package: package,
      holder_name: "#{holder_prefix} ##{ticket_seq}",
      holder_phone: format("819555%04d", ticket_seq),
      holder_email: "ticket#{ticket_seq}@example.com",
      refunded_at: is_refunded ? order.purchased_at + 2.hours : nil
    )
  end
end

# Cas 1: Sold out exact (4/4 actifs)
create_tickets.call(order: order_general_1, package: p_general, quantity: 2, holder_prefix: "General")
create_tickets.call(order: order_general_2, package: p_general, quantity: 2, holder_prefix: "General")

# Cas 2: Partiellement vendu (4 actifs + 1 remboursé, quota 6)
create_tickets.call(order: order_daily_1, package: p_daily, quantity: 3, refunded_indexes: [ 0 ], holder_prefix: "Daily")
create_tickets.call(order: order_daily_2, package: p_daily, quantity: 2, holder_prefix: "Daily")

# Cas 3: Sold out sur un second forfait (2/2 actifs)
create_tickets.call(order: order_daily_sold_out_1, package: p_daily_sold_out, quantity: 1, holder_prefix: "Daily Sold Out")
create_tickets.call(order: order_daily_sold_out_2, package: p_daily_sold_out, quantity: 1, holder_prefix: "Daily Sold Out")

# Cas 4: Dernières places (2/3 actifs)
create_tickets.call(order: order_evening_last_spots, package: p_evening_last_spots, quantity: 2, holder_prefix: "Evening Last Spots")

# Cas 5: Forfait archivé (1 actif + 1 remboursé)
create_tickets.call(order: order_completed, package: p_completed, quantity: 2, refunded_indexes: [ 1 ], holder_prefix: "Archive")

# Cas 6: Journalier jour 2 (5 actifs + 1 remboursé sur quota 8)
create_tickets.call(order: order_daily_day2_1, package: p_daily_day2, quantity: 3, refunded_indexes: [ 1 ], holder_prefix: "Daily Day2")
create_tickets.call(order: order_daily_day2_2, package: p_daily_day2, quantity: 3, holder_prefix: "Daily Day2")

# Cas 7: Soirée de nuit (3/4 actifs)
create_tickets.call(order: order_evening_overnight, package: p_evening_overnight, quantity: 3, holder_prefix: "Overnight")

# Cas 8: Passeport flex (4 actifs + 2 remboursés, quota 10)
create_tickets.call(order: order_general_flex_1, package: p_general_flex, quantity: 3, refunded_indexes: [ 0 ], holder_prefix: "General Flex")
create_tickets.call(order: order_general_flex_2, package: p_general_flex, quantity: 3, refunded_indexes: [ 2 ], holder_prefix: "General Flex")

# Attachement des images
images = {
  p_general => 'general-ticket.webp',
  p_daily   => 'daily-ticket.webp',
  p_evening => 'evening-ticket.jpg',
  p_daily_sold_out => 'daily-ticket.webp',
  p_evening_last_spots => 'evening-ticket.jpg',
  p_daily_day2 => 'daily-ticket.webp',
  p_evening_overnight => 'evening-ticket.jpg',
  p_general_flex => 'general-ticket.webp',
  p_completed => 'general-ticket.webp',
  # unite actuel
  unit1 => 'hotel-image.jpg',
  unit_hotel_mid => 'hotel-mid.jpg',
  unit_hotel_high => 'hotel-high.jpg',
  unit_camp_low => 'camping-cheap.jpg',
  unit_camp_high => 'oubliette.jpg',
  unit_hotel_basic   => 'hotel-water.jpg',
  unit_hotel_double  => 'hotel-water-2.jpg',
  unit_camp_standard => 'lava-camping.jpg',
  unit_camp_premium  => 'lava-camping-2.jpg',
  # unite passe
  unit1old => 'hotel-image.jpg',
  unit_hotel_mid_old => 'hotel-mid.jpg',
  unit_hotel_high_old => 'hotel-high.jpg',
  unit_camp_low_old => 'camping-cheap.jpg',
  unit_camp_high_old => 'oubliette.jpg',
  unit_hotel_basic_old   => 'hotel-water.jpg',
  unit_hotel_double_old  => 'hotel-water-2.jpg',
  unit_camp_standard_old => 'lava-camping.jpg',
  unit_camp_premium_old  => 'lava-camping-2.jpg'
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
  end
end

## Alexandre 2

#actuel
unit1.save!
unit_camp_high.save!
unit_camp_low.save!
unit_hotel_high.save!
unit_hotel_mid.save!
unit_hotel_basic.save!
unit_hotel_double.save!
unit_camp_standard.save!
unit_camp_premium.save!

#passe

unit1old.save!
unit_camp_high_old.save!
unit_camp_low_old.save!
unit_hotel_high_old.save!
unit_hotel_mid_old.save!
unit_hotel_basic_old.save!
unit_hotel_double_old.save!
unit_camp_standard_old.save!
unit_camp_premium_old.save!

# Reservations festival actuel

res1 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15),
  departure_at: Date.new(2026, 7, 17),
  nb_of_people: 1,
  reservation_name: "Jean Daniel",
  phone_number: "8195553333",
  user: c,
  unit: unit1,
  festival: f
)

res2 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15),
  departure_at: Date.new(2026, 7, 18),
  nb_of_people: 6, 
  reservation_name: "Alice Wonderland",
  phone_number: "8195554444",
  user: c2,
  unit: unit_camp_high,
  festival: f,
  status: :cancelled
)

res3 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15),
  departure_at: Date.new(2026, 7, 19),
  nb_of_people: 4,
  reservation_name: "Bob Builder",
  phone_number: "8195555555",
  user: c3,
  unit: unit_camp_high,
  festival: f
)

res4 = Reservation.create!(
  arrival_at: f.start_at,
  departure_at: f.end_at,
  nb_of_people: 2, 
  reservation_name: "Charlie Day",
  phone_number: "8195556666",
  user: c,
  unit: unit_hotel_double,
  festival: f,
  status: :cancelled
)

res5 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15), 
  departure_at: Date.new(2026, 7, 17),
  nb_of_people: 2, 
  reservation_name: "Dana Scully",
  phone_number: "8195557777",
  user: c4,
  unit: unit_camp_standard,
  festival: f
)

# Reservations festival passe

res1old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 15),
  departure_at: Date.new(2025, 7, 17),
  nb_of_people: 1,
  reservation_name: "Jean Daniel",
  phone_number: "+1 (819) 555-3333",
  user: c,
  unit: unit1old,
  festival: f2,
  status: :completed
)

res2old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 15),
  departure_at: Date.new(2025, 7, 16),
  nb_of_people: 6,
  reservation_name: "Alice Wonderland",
  phone_number: "+1 (819) 555-4444",
  user: c2,
  unit: unit_camp_high_old,
  festival: f2,
  status: :completed
)

res3old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 17),
  departure_at: Date.new(2025, 7, 18),
  nb_of_people: 4,
  reservation_name: "Bob Builder",
  phone_number: "+1 (819) 555-5555",
  user: c3,
  unit: unit_camp_high_old,
  festival: f2,
  status: :completed
)

res4old = Reservation.create!(
  arrival_at: f2.start_at,
  departure_at: f2.end_at,
  nb_of_people: 2,
  reservation_name: "Charlie Day",
  phone_number: "+1 (819) 555-6666",
  user: c,
  unit: unit_hotel_double_old,
  festival: f2,
  status: :completed
)

res5old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 15),
  departure_at: Date.new(2025, 7, 17),
  nb_of_people: 2,
  reservation_name: "Dana Scullier",
  phone_number: "+1 (819) 555-7777",
  user: c4,
  unit: unit_camp_standard_old,
  festival: f2,
  status: :completed
)

res6old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 18),
  departure_at: Date.new(2025, 7, 20),
  nb_of_people: 1,
  reservation_name: "Jean Danielier",
  phone_number: "+1 (819) 555-3333",
  user: c,
  unit: unit1old,
  festival: f2,
  status: :completed
)

res7old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 18),
  departure_at: Date.new(2025, 7, 20),
  nb_of_people: 6,
  reservation_name: "Alice Wonderlander",
  phone_number: "+1 (819) 555-4444",
  user: c2,
  unit: unit_camp_high_old,
  festival: f2,
  status: :completed
)

res8old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 18),
  departure_at: Date.new(2025, 7, 19),
  nb_of_people: 4,
  reservation_name: "Bob Builderer",
  phone_number: "+1 (819) 555-5555",
  user: c3,
  unit: unit_camp_high_old,
  festival: f2,
  status: :completed
)

res9old = Reservation.create!(
  arrival_at: f2.start_at,
  departure_at: f2.end_at,
  nb_of_people: 1,
  reservation_name: "Charlie Gayer",
  phone_number: "+1 (819) 555-6666",
  user: c,
  unit: unit_hotel_basic_old,
  festival: f2,
  status: :completed
)

res10old = Reservation.create!(
  arrival_at: Date.new(2025, 7, 19),
  departure_at: Date.new(2025, 7, 20),
  nb_of_people: 2,
  reservation_name: "Dana Scullier",
  phone_number: "+1 (819) 555-7777",
  user: c4,
  unit: unit_camp_standard_old,
  festival: f2,
  status: :completed
)

[ p_general, p_daily, p_evening, p_daily_sold_out, p_evening_last_spots, p_daily_day2, p_evening_overnight, p_general_flex ].each do |pkg|
  sold = pkg.tickets.where(refunded_at: nil).count
  refunded = pkg.tickets.where.not(refunded_at: nil).count
end


# Laurent

task_one = Task.create!(
    title: "Task #1",
    description: "Description of Task #1",
    difficulty: 3,
    priority: 1,
    reusable: true

)
task_one.file.attach(
  io: File.open(Rails.root.join('db/files/images.jpg')),
  filename: 'images.jpg',
  content_type: 'images/jpg'
)

task_tow = Task.create!(
    title: "installation de la scène",
    description: "Installation de la scène pour le concert",
    difficulty: 5,
    priority: 3,
    reusable: false
)
task_tow.file.attach(
  io: File.open(Rails.root.join('db/files/test.txt')),
  filename: 'test.txt',
  content_type: 'test/txt'
)

task_three = Task.create!(
    title: "reception du materiel",
    description: "receptionné la commande de projecteur de projecteur & co",
    difficulty: 1,
    priority: 5,
    reusable: true
)
task_three.file.attach(
  io: File.open(Rails.root.join('db/files/meme-carre-chat-vibrant-simple_742173-4493.avif')),
  filename: 'meme-carre-chat-vibrant-simple_742173-4493.avif',
  content_type: 'meme-carre-chat-vibrant-simple_742173-4493/avif'
)

Affectation.create!(
    user: Staff.first,
    task: task_one,
    festival: f,
    responsability: "Affectation de la tache 1",
    expected_start: f.start_at.to_time.change(hour: 8, min: 0),
    expected_end: f.start_at.to_time.change(hour: 12, min: 0)
)

Affectation.create!(
    user: Staff.first,
    task: task_tow,
    festival: f,
    responsability: "Assurer la bonne installation de la scène",
    expected_start: f.start_at.to_time.change(hour: 13, min: 0),
    expected_end: f.start_at.to_time.change(hour: 17, min: 0)
)

Affectation.create!(
    user: Staff.first,
    task: task_three,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 9, min: 0),
    expected_end: f.start_at.to_time.change(hour: 10, min: 0)
)

Affectation.create!(
    user: Staff.last,
    task: task_one,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 8, min: 0),
    expected_end: f.start_at.to_time.change(hour: 12, min: 0)
)

Affectation.create!(
    user: Staff.last,
    task: task_one,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 13, min: 0),
    expected_end: f.start_at.to_time.change(hour: 17, min: 0)
)

Affectation.create!(
    user: Staff.last,
    task: task_one,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 9, min: 0),
    expected_end: f.start_at.to_time.change(hour: 10, min: 0),
    start: f.start_at.to_time.change(hour: 9, min: 0),
    end: f.start_at.to_time.change(hour: 10, min: 0)

)

Affectation.create!(
    user: Staff.last,
    task: task_one,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 10, min: 0),
    expected_end: f.start_at.to_time.change(hour: 12, min: 0),
    start: f.start_at.to_time.change(hour: 10, min: 0),
    end: f.start_at.to_time.change(hour: 12, min: 0)
)
