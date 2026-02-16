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

ActiveRecord::Schema[8.1].define(version: 2026_02_16_134308) do
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
    t.string "address", limit: 250, null: false
    t.text "comment"
    t.integer "coordinates", null: false
    t.datetime "created_at", null: false
    t.integer "daily_capacity", null: false
    t.date "end_at", null: false
    t.string "name", limit: 100, null: false
    t.decimal "other_expense", precision: 10, scale: 2
    t.decimal "other_income", precision: 10, scale: 2
    t.integer "satisfaction", limit: 1
    t.date "start_at", null: false
    t.string "status", limit: 20, null: false
    t.datetime "updated_at", null: false
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

  add_foreign_key "affectations", "festivals"
  add_foreign_key "affectations", "tasks"
  add_foreign_key "affectations", "users"
  add_foreign_key "performances", "artists"
  add_foreign_key "performances", "festivals"
  add_foreign_key "performances", "stages"
end
