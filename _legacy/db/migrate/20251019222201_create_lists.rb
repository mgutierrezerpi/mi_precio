class CreateLists < ActiveRecord::Migration[8.0]
  def change
    create_table :lists do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :published, default: false, null: false
      t.boolean :show_on_index, default: false, null: false

      t.timestamps
    end

    add_index :lists, [:tenant_id, :show_on_index]
    add_index :lists, [:tenant_id, :published]
  end
end
