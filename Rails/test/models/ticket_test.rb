require "test_helper"
require "cgi"

class TicketTest < ActiveSupport::TestCase
  test "generate_qr_code embeds the unique code" do
    ticket = tickets(:one)

    qr_url = ticket.generate_qr_code(size: 300)

    assert_includes qr_url, "size=300x300"
    assert_includes qr_url, CGI.escape(ticket.unique_code)
  end

  test "valid_at_scan? returns true when scan is within validity range and ticket is not refunded" do
    ticket = tickets(:one)
    scan_time = ticket.package.valid_at + 1.hour

    assert ticket.valid_at_scan?(scan_time)
  end

  test "valid_at_scan? returns false when ticket is refunded" do
    ticket = tickets(:one)
    ticket.update_column(:refunded, true)
    scan_time = ticket.package.valid_at + 1.hour

    assert_not ticket.valid_at_scan?(scan_time)
  end

  test "valid_at_scan? returns false when scan time is out of validity range" do
    ticket = tickets(:one)
    scan_time = ticket.package.expired_at + 1.minute

    assert_not ticket.valid_at_scan?(scan_time)
  end
end
