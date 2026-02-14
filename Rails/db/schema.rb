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

ActiveRecord::Schema[8.1].define(version: 2026_02_14_182114) do
  create_table "festivals", charset: "utf8mb4", collation: "utf8mb4_uca1400_ai_ci", force: :cascade do |t|
    t.string "address", limit: 250, null: false
    t.text "comment"
    t.integer "coordinates", null: false
    t.datetime "created_at", null: false
    t.integer "daily_capacity", null: false
    t.date "end_at", null: false
    t.decimal "other_expense", precision: 10
    t.decimal "other_income", precision: 10
    t.integer "satisfaction", limit: 1
    t.date "start_at", null: false
    t.string "statut", default: "DRAFT", null: false
    t.datetime "updated_at", null: false
    t.check_constraint "`daily_capacity` > 0", name: "check_festivals_daily_capacity_positive"
    t.check_constraint "`satisfaction` >= 0 and `satisfaction` <= 5", name: "check_festivals_satisfaction_range"
    t.check_constraint "`start_at` <= `end_at`", name: "check_festivals_dates_chronology"
    t.check_constraint "`statut` in ('DRAFT','ONGOING','COMPLETED')", name: "check_festivals_statut_enum"
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
    t.string "role"
    t.string "type"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["type"], name: "index_users_on_type"
  end
end
