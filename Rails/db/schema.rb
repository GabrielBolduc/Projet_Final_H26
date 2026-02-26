# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_26_014644) do
  create_table "accommodations", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.string "address", null: false
    t.integer "category", limit: 1, null: false
    t.decimal "commission", precision: 4, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.bigint "festival_id", null: false
    t.decimal "latitude", precision: 10, scale: 8, null: false
    t.decimal "longitude", precision: 11, scale: 8, null: false
    t.string "name", limit: 100, null: false
    t.boolean "shuttle", default: false, null: false
    t.time "time_car", null: false
    t.time "time_walk", null: false
    t.datetime "updated_at", null: false
    t.index ["festival_id"], name: "index_accommodations_on_festival_id"
    t.check_constraint "`commission` >= 0 and `commission` < 30", name: "chk_commission"
    t.check_constraint "trim(`address`) <> ''", name: "chk_address_not_empty"
    t.check_constraint "trim(`name`) <> ''", name: "chk_name_not_empty"
  end

  create_table "active_storage_attachments", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "affectations", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "end"
    t.datetime "expected_end"
    t.datetime "expected_start"
    t.bigint "festival_id", null: false
    t.string "responsability"
    t.datetime "start"
    t.bigint "task_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["festival_id"], name: "index_affectations_on_festival_id"
    t.index ["task_id"], name: "index_affectations_on_task_id"
    t.index ["user_id"], name: "index_affectations_on_user_id"
  end

  create_table "artists", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "genre", limit: 50, null: false
    t.string "name", limit: 100, null: false
    t.integer "popularity", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_artists_on_name", unique: true
  end

  create_table "festivals", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.string "address", null: false
    t.text "comment"
    t.datetime "created_at", null: false
    t.integer "daily_capacity", null: false
    t.date "end_at", null: false
    t.decimal "latitude", precision: 10, scale: 8, null: false
    t.decimal "longitude", precision: 11, scale: 8, null: false
    t.string "name", limit: 100, null: false
    t.decimal "other_expense", precision: 10, scale: 2
    t.decimal "other_income", precision: 10, scale: 2
    t.integer "satisfaction", limit: 1
    t.date "start_at", null: false
    t.string "status", limit: 20, null: false
    t.datetime "updated_at", null: false
  end

  create_table "orders", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "purchased_at", default: -> { "current_timestamp(6)" }, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "packages", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.string "category", default: "GENERAL", null: false
    t.datetime "created_at", null: false
    t.text "description", size: :tiny
    t.datetime "expired_at", null: false
    t.bigint "festival_id", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "quota", null: false
    t.string "title", limit: 50, null: false
    t.datetime "updated_at", null: false
    t.datetime "valid_at", null: false
    t.index ["festival_id"], name: "index_packages_on_festival_id"
  end

  create_table "performances", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.bigint "artist_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "end_at", null: false
    t.bigint "festival_id", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.bigint "stage_id", null: false
    t.datetime "start_at", null: false
    t.string "title", limit: 20
    t.datetime "updated_at", null: false
    t.index ["artist_id"], name: "index_performances_on_artist_id"
    t.index ["festival_id"], name: "index_performances_on_festival_id"
    t.index ["stage_id"], name: "index_performances_on_stage_id"
  end

  create_table "reservations", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.date "arrival_at", null: false
    t.datetime "created_at", null: false
    t.date "departure_at", null: false
    t.bigint "festival_id", null: false
    t.integer "nb_of_people", limit: 1, null: false, unsigned: true
    t.string "phone_number", limit: 20, null: false
    t.string "reservation_name", limit: 100, null: false
    t.bigint "unit_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["festival_id"], name: "index_reservations_on_festival_id"
    t.index ["unit_id"], name: "index_reservations_on_unit_id"
    t.index ["user_id"], name: "index_reservations_on_user_id"
    t.check_constraint "`arrival_at` < `departure_at`", name: "chk_dates"
    t.check_constraint "`nb_of_people` > 0", name: "chk_guests"
    t.check_constraint "`phone_number` regexp '^[0-9]{8,15}$'", name: "chk_phone_numeric"
    t.check_constraint "trim(`reservation_name`) <> ''", name: "chk_name_not_empty"
  end

  create_table "stages", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.integer "capacity", null: false
    t.datetime "created_at", null: false
    t.string "environment", limit: 50, null: false
    t.string "name", limit: 100, null: false
    t.text "technical_specs"
    t.datetime "updated_at", null: false
  end

  create_table "tasks", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "difficulty"
    t.integer "priority"
    t.boolean "reusable"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "tickets", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "holder_email", null: false
    t.string "holder_name", limit: 100, null: false
    t.string "holder_phone", limit: 20, null: false
    t.bigint "order_id", null: false
    t.bigint "package_id", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.boolean "refunded", default: false
    t.datetime "refunded_at"
    t.string "unique_code", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_tickets_on_order_id"
    t.index ["package_id"], name: "index_tickets_on_package_id"
    t.index ["unique_code"], name: "index_tickets_on_unique_code", unique: true
  end

  create_table "units", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.bigint "accommodation_id", null: false
    t.decimal "cost_person_per_night", precision: 6, scale: 2, null: false
    t.datetime "created_at", null: false
    t.boolean "electricity", default: false
    t.column "food_options", "set('None','Canteen','Room service','Restaurant')", default: "None"
    t.decimal "parking_cost", precision: 4, scale: 2, default: "0.0", null: false, unsigned: true
    t.integer "quantity", limit: 1, null: false, unsigned: true
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.integer "water", limit: 1, default: 0
    t.boolean "wifi", default: false, null: false
    t.index ["accommodation_id"], name: "index_units_on_accommodation_id"
    t.check_constraint "`quantity` > 0", name: "chk_quantity"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.string "ability"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name"
    t.string "phone_number"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "type"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["type"], name: "index_users_on_type"
  end

  add_foreign_key "accommodations", "festivals"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "affectations", "festivals"
  add_foreign_key "affectations", "tasks"
  add_foreign_key "affectations", "users"
  add_foreign_key "orders", "users"
  add_foreign_key "packages", "festivals", on_delete: :cascade
  add_foreign_key "performances", "artists"
  add_foreign_key "performances", "festivals"
  add_foreign_key "performances", "stages"
  add_foreign_key "reservations", "festivals"
  add_foreign_key "reservations", "units"
  add_foreign_key "reservations", "users"
  add_foreign_key "tickets", "orders"
  add_foreign_key "tickets", "packages"
  add_foreign_key "units", "accommodations"
end
