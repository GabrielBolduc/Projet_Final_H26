require "test_helper"

class TicketingStatsTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @festival_one = festivals(:one)
    @festival_two = festivals(:two)
    @festival_three = festivals(:three)
  end

  test "non admin cannot access stats" do
    sign_in @client

    get api_ticketing_stats_url(format: :json), as: :json

    json = parsed_body
    assert_equal "error", json["status"]
    assert_equal "Accès refusé : Privilèges administrateur requis.", json["message"]
  end

  test "admin receives stats for all festivals with expected fields" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json), as: :json

    # format reponse
    json = parsed_body
    assert_equal "success", json["status"]

    data = json["data"]
    ids = data.map { |row| row["id"] }
    assert_includes ids, @festival_one.id
    assert_includes ids, @festival_two.id
    assert_includes ids, @festival_three.id

    sample = data.find { |row| row["id"] == @festival_one.id }
    %w[
      id name start_at end_at year total_tickets_sold expenses_total expenses_performance expenses_other
      revenues_total revenues_tickets revenues_other profit avg_tickets_per_order refunds_count refunds_amount
    ].each do |key|
      assert sample.key?(key)
    end
    assert_equal @festival_one.name, sample["name"]
    assert_equal @festival_one.start_at.year, sample["year"]
  end

  test "date range filter with only start_date keeps festivals ending after date" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, start_date: "2026-09-01"), as: :json

    json = parsed_body
    assert_equal "success", json["status"]

    ids = json["data"].map { |row| row["id"] }.sort
    assert_equal [ @festival_three.id ], ids
  end

  test "date range filter with only end_date keeps festivals starting before date" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, end_date: "2025-07-10"), as: :json

    json = parsed_body
    assert_equal "success", json["status"]

    ids = json["data"].map { |row| row["id"] }.sort
    assert_equal [ @festival_two.id ], ids
  end

  test "date range filter returns only matching festivals" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, start_date: "2026-08-01", end_date: "2026-08-03"), as: :json

    json = parsed_body
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }
    assert_equal [ @festival_one.id ], ids.sort
  end

  test "invalid date params are ignored and return all festivals" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, start_date: "invalid-date"), as: :json

    json = parsed_body
    assert_equal "success", json["status"]

    ids = json["data"].map { |row| row["id"] }.sort
    expected = [ @festival_one.id, @festival_two.id, @festival_three.id ].sort
    assert_equal expected, ids
  end

  test "category filter limits ticket and refund counts" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, categories: "general"), as: :json

    json = parsed_body
    assert_equal "success", json["status"]
    data = json["data"]

    festival_row = data.find { |row| row["id"] == @festival_one.id }
    category_value = Package.categories["general"]
    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id, category: category_value })

    expected_total_tickets_sold = ticket_scope.where(refunded_at: nil).count
    expected_refunds_count = ticket_scope.where.not(refunded_at: nil).count
    expected_refunds_amount = ticket_scope.where.not(refunded_at: nil).sum(:price).to_f.round(2)
    expected_ticket_revenue = ticket_scope.where(refunded_at: nil).sum(:price).to_f.round(2)
    order_ids = Order.joins(tickets: :package)
                     .where(packages: { festival_id: @festival_one.id, category: category_value })
                     .distinct
                     .select(:id)
    expected_total_discounts = Order.where(id: order_ids).sum(:discount).to_f.round(2)

    expected_revenues_tickets = (expected_ticket_revenue - expected_total_discounts).round(2)
    expected_avg = order_ids.count > 0 ? (expected_total_tickets_sold.to_f / order_ids.count).round(2) : 0

    assert_equal expected_total_tickets_sold, festival_row["total_tickets_sold"]
    assert_equal expected_refunds_count, festival_row["refunds_count"]
    assert_in_delta expected_refunds_amount, festival_row["refunds_amount"].to_f, 0.01
    assert_in_delta expected_revenues_tickets, festival_row["revenues_tickets"].to_f, 0.01
    assert_in_delta expected_avg, festival_row["avg_tickets_per_order"].to_f, 0.01
  end

  test "category filter accepts arrays and applies multiple categories" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json, categories: [ "general", "daily" ]), as: :json

    json = parsed_body
    assert_equal "success", json["status"]

    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }
    category_values = [ Package.categories["general"], Package.categories["daily"] ]
    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id, category: category_values })

    expected_total_tickets_sold = ticket_scope.where(refunded_at: nil).count
    expected_refunds_count = ticket_scope.where.not(refunded_at: nil).count

    assert_equal expected_total_tickets_sold, festival_row["total_tickets_sold"]
    assert_equal expected_refunds_count, festival_row["refunds_count"]
  end

  test "festival with only refunded tickets reports zero sales and refund amounts" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json), as: :json

    json = parsed_body
    assert_equal "success", json["status"]

    festival_row = json["data"].find { |row| row["id"] == @festival_two.id }
    assert_equal 0, festival_row["total_tickets_sold"]
    assert_equal 1, festival_row["refunds_count"]
    assert_in_delta 55.0, festival_row["refunds_amount"].to_f, 0.01
  end

  test "calculations for festival one match database totals" do
    sign_in @admin

    get api_ticketing_stats_url(format: :json), as: :json

    json = parsed_body
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }

    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id })
    expected_total_tickets_sold = ticket_scope.where(refunded_at: nil).count
    expected_refunds_count = ticket_scope.where.not(refunded_at: nil).count
    expected_refunds_amount = ticket_scope.where.not(refunded_at: nil).sum(:price).to_f.round(2)
    expected_ticket_revenue = ticket_scope.where(refunded_at: nil).sum(:price).to_f.round(2)
    order_ids = Order.joins(tickets: :package).where(packages: { festival_id: @festival_one.id }).distinct.select(:id)
    expected_total_discounts = Order.where(id: order_ids).sum(:discount).to_f.round(2)

    expected_expenses_performance = @festival_one.performances.sum(:price).to_f.round(2)
    expected_expenses_other = (@festival_one.other_expense || 0).to_f.round(2)
    expected_expenses_total = (expected_expenses_performance + expected_expenses_other).round(2)

    expected_revenues_other = (@festival_one.other_income || 0).to_f.round(2)
    expected_revenues_tickets = (expected_ticket_revenue - expected_total_discounts).round(2)
    expected_revenues_total = (expected_revenues_other + expected_revenues_tickets).round(2)
    expected_profit = (expected_revenues_total - expected_expenses_total).round(2)

    expected_avg = order_ids.count > 0 ? (expected_total_tickets_sold.to_f / order_ids.count).round(2) : 0

    assert_equal expected_total_tickets_sold, festival_row["total_tickets_sold"]
    assert_equal expected_refunds_count, festival_row["refunds_count"]
    assert_in_delta expected_refunds_amount, festival_row["refunds_amount"].to_f, 0.01

    assert_in_delta expected_expenses_total, festival_row["expenses_total"].to_f, 0.01
    assert_in_delta expected_expenses_performance, festival_row["expenses_performance"].to_f, 0.01
    assert_in_delta expected_expenses_other, festival_row["expenses_other"].to_f, 0.01

    assert_in_delta expected_revenues_total, festival_row["revenues_total"].to_f, 0.01
    assert_in_delta expected_revenues_tickets, festival_row["revenues_tickets"].to_f, 0.01
    assert_in_delta expected_revenues_other, festival_row["revenues_other"].to_f, 0.01

    assert_in_delta expected_profit, festival_row["profit"].to_f, 0.01
    assert_in_delta expected_avg, festival_row["avg_tickets_per_order"].to_f, 0.01
  end

  test "discounts reduce ticket revenues when present" do
    sign_in @admin

    order = Order.create!(user: @client, discount: 10.00)
    package = packages(:two)
    2.times do |i|
      Ticket.create!(
        order: order,
        package: package,
        holder_name: "Discount Holder #{i}",
        holder_email: "discount#{i}@example.com",
        holder_phone: "555-000#{i}"
      )
    end

    get api_ticketing_stats_url(format: :json), as: :json

    json = parsed_body
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }

    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id })
    expected_ticket_revenue = ticket_scope.where(refunded_at: nil).sum(:price).to_f.round(2)
    order_ids = Order.joins(tickets: :package).where(packages: { festival_id: @festival_one.id }).distinct.select(:id)
    expected_total_discounts = Order.where(id: order_ids).sum(:discount).to_f.round(2)
    expected_revenues_tickets = (expected_ticket_revenue - expected_total_discounts).round(2)

    assert_operator expected_total_discounts, :>, 0
    assert_in_delta expected_revenues_tickets, festival_row["revenues_tickets"].to_f, 0.01
  end

  private

  def parsed_body
    JSON.parse(response.body)
  end
end
