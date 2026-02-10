class ConvertRolesToTypes < ActiveRecord::Migration[8.1]
  def up
    User.where(role: 'ADMIN').update_all(type: 'Admin')
    User.where(role: 'STAFF').update_all(type: 'Staff')
    User.where(role: 'CLIENT').update_all(type: 'Client')

    User.where(type: nil).update_all(type: 'Client', role: 'CLIENT')
  end
  def down
    User.update_all(type: nil)
  end
end
