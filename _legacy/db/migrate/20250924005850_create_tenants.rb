class CreateTenants < ActiveRecord::Migration[8.0]
  def change
    create_table :tenants do |t|
      t.string :name
      t.string :subdomain
      t.string :database

      t.timestamps
    end
    add_index :tenants, :subdomain, unique: true
    add_index :tenants, :database, unique: true
  end
end
