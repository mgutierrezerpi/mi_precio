class CreateListVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :list_versions do |t|
      t.references :list, null: false, foreign_key: true
      t.integer :version_number, null: false, default: 1
      t.string :name
      t.boolean :published, default: false, null: false
      t.datetime :published_at

      t.timestamps
    end

    add_index :list_versions, [:list_id, :version_number], unique: true
    add_index :list_versions, [:list_id, :published]
  end
end
