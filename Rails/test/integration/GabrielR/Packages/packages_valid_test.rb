require "test_helper"

class PackagesValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @ongoing_festival = festivals(:one)
    @completed_festival = festivals(:two)
    @draft_festival = festivals(:three)
    @package = packages(:one)
    sign_in @admin
  end

  # INDEX
  test "index defaults to ongoing festival packages sorted by price asc" do
    get api_packages_url
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]

    returned_ids = json["data"].map { |pkg| pkg["id"] }
    expected_ids = [packages(:four), packages(:two), packages(:seven), packages(:three), packages(:one)].map(&:id)
    assert_equal expected_ids, returned_ids

    statuses = json["data"].map { |pkg| pkg.dig("festival", "status") }.uniq
    assert_equal [ "ongoing" ], statuses
  end

  test "index with explicit completed status returns only completed festival packages" do
    get api_packages_url, params: { status: "completed" }
    assert_response :ok

    json = parsed_body
    assert_equal [packages(:five).id], json["data"].map { |pkg| pkg["id"] }
    assert_equal [ "completed" ], json["data"].map { |pkg| pkg.dig("festival", "status") }.uniq
  end

  test "index with explicit draft status returns only draft festival packages" do
    get api_packages_url, params: { status: "draft" }
    assert_response :ok

    json = parsed_body
    assert_equal [packages(:six).id], json["data"].map { |pkg| pkg["id"] }
    assert_equal [ "draft" ], json["data"].map { |pkg| pkg.dig("festival", "status") }.uniq
  end

  test "festival_id has priority over status fallback/filter" do
    get api_packages_url, params: { festival_id: @completed_festival.id, status: "ongoing" }
    assert_response :ok

    json = parsed_body
    assert_equal [packages(:five).id], json["data"].map { |pkg| pkg["id"] }
    assert_equal [@completed_festival.id], json["data"].map { |pkg| pkg["festival_id"] }.uniq
  end

  test "index search is case-insensitive" do
    get api_packages_url, params: { q: "eVeNiNg", status: "ongoing" }
    assert_response :ok

    json = parsed_body
    assert_equal [packages(:three).id], json["data"].map { |pkg| pkg["id"] }
  end

  test "index search with no match returns empty list" do
    get api_packages_url, params: { q: "no-match-title", status: "ongoing" }
    assert_response :ok

    json = parsed_body
    assert_equal [], json["data"]
  end

  test "index categories filter accepts comma-separated values" do
    get api_packages_url, params: { status: "ongoing", categories: "daily,evening" }
    assert_response :ok

    json = parsed_body
    ids = json["data"].map { |pkg| pkg["id"] }
    assert_equal [packages(:four).id, packages(:two).id, packages(:three).id], ids
  end

  test "index categories filter returns empty when all categories are invalid" do
    get api_packages_url, params: { status: "ongoing", categories: "vip,weekend,zzz" }
    assert_response :ok

    json = parsed_body
    assert_equal [], json["data"]
  end

  test "index supports date_desc sort" do
    get api_packages_url, params: { status: "ongoing", sort: "date_desc" }
    assert_response :ok

    json = parsed_body
    ids = json["data"].map { |pkg| pkg["id"] }
    assert_equal [packages(:seven).id, packages(:four).id, packages(:three).id, packages(:two).id, packages(:one).id], ids
  end

  test "index supports price_desc sort" do
    get api_packages_url, params: { status: "ongoing", sort: "price_desc" }
    assert_response :ok

    json = parsed_body
    ids = json["data"].map { |pkg| pkg["id"] }
    assert_equal [packages(:one).id, packages(:three).id, packages(:seven).id, packages(:two).id, packages(:four).id], ids
  end

  # SHOW
  test "show returns package with sold count excluding refunded tickets" do
    get api_package_url(@package)
    assert_response :ok

    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal @package.id, json.dig("data", "id")
    assert_equal 1, json.dig("data", "sold")
    assert_equal @ongoing_festival.id, json.dig("data", "festival", "id")
  end

  # CREATE
  test "admin can create package with valid data" do
    payload = valid_package_payload(
      title: "Integration Created Package",
      category: "daily",
      festival_id: @ongoing_festival.id,
      price: 88.50,
      quota: 20
    )

    assert_difference("Package.count", 1) do
      post api_packages_url, params: payload, as: :json
    end

    assert_response :ok
    json = parsed_body

    assert_equal "success", json["status"]
    assert_equal "Integration Created Package", json.dig("data", "title")
    assert_equal "daily", json.dig("data", "category")
    assert_equal 88.5, json.dig("data", "price").to_f
    assert_equal 0, json.dig("data", "sold")
    assert_equal @ongoing_festival.id, json.dig("data", "festival_id")
  end

  # UPDATE
  test "admin can update package fields" do
    assert_no_difference("Package.count") do
      put api_package_url(@package), params: { package: { title: "Updated Title", price: 99.99, category: "evening" } }, as: :json
    end

    assert_response :ok
    json = parsed_body

    assert_equal "success", json["status"]
    assert_equal "Updated Title", json.dig("data", "title")
    assert_equal 99.99, json.dig("data", "price").to_f
    assert_equal "evening", json.dig("data", "category")
  end

  # DESTROY
  test "admin can delete package without tickets and receives deleted payload" do
    deletable = packages(:seven)

    assert_difference("Package.count", -1) do
      delete api_package_url(deletable), as: :json
    end

    assert_response :ok
    json = parsed_body
    assert_equal "success", json["status"]
    assert_equal "Package deleted successfully", json["message"]
    assert_equal deletable.id, json.dig("data", "id")
    assert_equal deletable.title, json.dig("data", "title")
    assert_equal deletable.festival_id, json.dig("data", "festival_id")
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end

  def valid_package_payload(overrides = {})
    base = {
      title: "New Package",
      description: "Description valide pour integration test",
      price: 50.0,
      quota: 10,
      category: "general",
      valid_at: "2026-08-02 10:00:00",
      expired_at: "2026-08-02 20:00:00",
      festival_id: @ongoing_festival.id
    }

    { package: base.merge(overrides) }
  end
end
