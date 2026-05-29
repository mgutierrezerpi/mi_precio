class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items do |t|
      t.references :list_version, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.text :description
      t.integer :position, default: 0

      t.timestamps
    end

    add_index :items, [:list_version_id, :position]
  end
end
