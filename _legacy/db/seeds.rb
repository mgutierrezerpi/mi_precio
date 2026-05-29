# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data in development
if Rails.env.development?
  puts "Clearing existing data..."
  Item.destroy_all
  ListVersion.destroy_all
  List.destroy_all
  Tenant.destroy_all
end

# Create sample tenants for testing
puts "Creating sample tenants..."

# Restaurant 1 - Pizzeria
tenant1 = Tenant.create!(
  name: "Luigi's Pizzeria",
  subdomain: "pizzeria",
  database: "pizzeria"
)
puts "Created tenant: #{tenant1.name} (#{tenant1.subdomain})"

# Restaurant 2 - Sushi
tenant2 = Tenant.create!(
  name: "Tokyo Sushi Bar",
  subdomain: "sushi",
  database: "sushi"
)
puts "Created tenant: #{tenant2.name} (#{tenant2.subdomain})"

# Restaurant 3 - Tacos
tenant3 = Tenant.create!(
  name: "El Mariachi Tacos",
  subdomain: "tacos",
  database: "tacos"
)
puts "Created tenant: #{tenant3.name} (#{tenant3.subdomain})"

puts "\nCreating menus and items..."

# Create menu for Pizzeria
pizzeria_menu = tenant1.lists.create!(
  name: "Main Menu",
  published: true,
  show_on_index: true
)

pizzeria_v1 = pizzeria_menu.create_new_version(name: "Spring 2025")
pizzeria_v1.publish!

# Add items to pizzeria menu
[
  { name: "Margherita Pizza", price: 14.99, description: "Classic pizza with fresh mozzarella, tomato sauce, and basil" },
  { name: "Pepperoni Pizza", price: 16.99, description: "Traditional pepperoni with mozzarella and tomato sauce" },
  { name: "Quattro Formaggi", price: 18.99, description: "Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta" },
  { name: "Vegetarian Supreme", price: 17.99, description: "Bell peppers, mushrooms, onions, olives, and fresh tomatoes" },
  { name: "Meat Lovers", price: 19.99, description: "Pepperoni, sausage, bacon, and ham" },
  { name: "Caesar Salad", price: 8.99, description: "Romaine lettuce, parmesan, croutons, and Caesar dressing" },
  { name: "Garlic Bread", price: 5.99, description: "Toasted Italian bread with garlic butter and herbs" },
  { name: "Tiramisu", price: 7.99, description: "Classic Italian dessert with espresso and mascarpone" }
].each do |item_data|
  pizzeria_v1.items.create!(item_data)
end

puts "  Created #{pizzeria_v1.items.count} items for #{tenant1.name}"

# Create menu for Sushi Bar
sushi_menu = tenant2.lists.create!(
  name: "Sushi Menu",
  published: true,
  show_on_index: true
)

sushi_v1 = sushi_menu.create_new_version(name: "Current Menu")
sushi_v1.publish!

# Add items to sushi menu
[
  { name: "California Roll", price: 12.99, description: "Crab, avocado, and cucumber with sesame seeds" },
  { name: "Spicy Tuna Roll", price: 14.99, description: "Fresh tuna with spicy mayo and cucumber" },
  { name: "Dragon Roll", price: 18.99, description: "Eel and cucumber topped with avocado and eel sauce" },
  { name: "Rainbow Roll", price: 19.99, description: "California roll topped with assorted sashimi" },
  { name: "Salmon Nigiri", price: 6.99, description: "2 pieces of fresh salmon over sushi rice" },
  { name: "Tuna Nigiri", price: 7.99, description: "2 pieces of fresh tuna over sushi rice" },
  { name: "Miso Soup", price: 3.99, description: "Traditional Japanese soup with tofu and seaweed" },
  { name: "Edamame", price: 4.99, description: "Steamed soybeans with sea salt" },
  { name: "Green Tea Ice Cream", price: 5.99, description: "Japanese-style green tea ice cream" }
].each do |item_data|
  sushi_v1.items.create!(item_data)
end

puts "  Created #{sushi_v1.items.count} items for #{tenant2.name}"

# Create menu for Tacos
tacos_menu = tenant3.lists.create!(
  name: "Menu del Día",
  published: true,
  show_on_index: true
)

tacos_v1 = tacos_menu.create_new_version(name: "Current Menu")
tacos_v1.publish!

# Add items to tacos menu
[
  { name: "Tacos al Pastor", price: 11.99, description: "3 tacos with marinated pork, pineapple, cilantro, and onion" },
  { name: "Tacos de Carne Asada", price: 12.99, description: "3 tacos with grilled steak, cilantro, and onion" },
  { name: "Tacos de Pescado", price: 13.99, description: "3 fish tacos with cabbage, pico de gallo, and chipotle mayo" },
  { name: "Quesadilla de Pollo", price: 10.99, description: "Grilled chicken quesadilla with cheese and peppers" },
  { name: "Burrito Supreme", price: 14.99, description: "Large burrito with choice of meat, rice, beans, and toppings" },
  { name: "Nachos Grandes", price: 12.99, description: "Tortilla chips with cheese, beans, jalapeños, and sour cream" },
  { name: "Guacamole & Chips", price: 7.99, description: "Fresh guacamole with crispy tortilla chips" },
  { name: "Churros", price: 6.99, description: "Fried dough pastry with cinnamon sugar and chocolate sauce" },
  { name: "Horchata", price: 3.99, description: "Traditional rice milk drink with cinnamon" }
].each do |item_data|
  tacos_v1.items.create!(item_data)
end

puts "  Created #{tacos_v1.items.count} items for #{tenant3.name}"

puts "\nCreating admin users..."

# Create admin user for each tenant
[tenant1, tenant2, tenant3].each do |tenant|
  user = tenant.users.create!(
    email: "admin@#{tenant.subdomain}.com",
    password: "password123",
    password_confirmation: "password123"
  )
  puts "  Created admin for #{tenant.name}: #{user.email}"
end

puts "\n✅ Seeding complete!"
puts "  Tenants: #{Tenant.count}"
puts "  Lists: #{List.count}"
puts "  List Versions: #{ListVersion.count}"
puts "  Items: #{Item.count}"
puts "  Users: #{User.count}"
puts "\nYou can visit:"
puts "  - http://pizzeria.localhost:3000 (admin@pizzeria.com / password123)"
puts "  - http://sushi.localhost:3000 (admin@sushi.com / password123)"
puts "  - http://tacos.localhost:3000 (admin@tacos.com / password123)"
puts "\nAdmin panel at: http://[subdomain].localhost:3000/admin"
