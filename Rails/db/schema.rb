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

ActiveRecord::Schema[8.1].define(version: 2026_02_16_152209) do
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
    t.text "description"
    t.datetime "expired_at", null: false
    t.bigint "festival_id", null: false
    t.decimal "price", precision: 10, null: false
    t.integer "quota", null: false
    t.string "title", limit: 100, null: false
    t.datetime "updated_at", null: false
    t.datetime "valid_at", null: false
    t.index ["festival_id"], name: "index_packages_on_festival_id"
    t.check_constraint "`category` in ('GENERAL','DAILY','EVENING')", name: "check_packages_category_enum"
    t.check_constraint "`price` >= 0.00", name: "check_packages_price_positive"
    t.check_constraint "`quota` > 0", name: "check_packages_quota_positive"
    t.check_constraint "`valid_at` <= `expired_at` and `expired_at` >= `valid_at`", name: "check_packages_dates_chronology"
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
    t.decimal "price", precision: 10, null: false
    t.datetime "purchased_at", null: false
    t.boolean "refunded", default: false
    t.datetime "refunded_at"
    t.string "unique_code", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_tickets_on_order_id"
    t.index ["package_id"], name: "index_tickets_on_package_id"
    t.check_constraint "`price` >= 0.00", name: "check_tickets_price_positive"
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "affectations", "festivals"
  add_foreign_key "affectations", "tasks"
  add_foreign_key "affectations", "users"
  add_foreign_key "orders", "users"
  add_foreign_key "packages", "festivals"
  add_foreign_key "tickets", "orders"
  add_foreign_key "tickets", "packages"
end
