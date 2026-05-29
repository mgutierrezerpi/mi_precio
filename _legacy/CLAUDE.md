# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiPrecio is a Ruby on Rails 8 application designed for displaying price lists and menus in restaurants. The application uses modern Rails conventions with Hotwire (Turbo + Stimulus) for interactivity and Tailwind CSS for styling.

## Technology Stack

- **Framework**: Ruby on Rails 8.0.3
- **Database**: PostgreSQL with multiple databases (primary, cache, queue, cable)
- **Frontend**: Hotwire (Turbo Rails + Stimulus), Tailwind CSS, Import Maps
- **Asset Pipeline**: Propshaft (modern Rails asset pipeline)
- **Background Jobs**: Solid Queue
- **Caching**: Solid Cache
- **WebSockets**: Solid Cable
- **Web Server**: Puma
- **Deployment**: Kamal (Docker-based deployment)

## Development Commands

### Starting the Application
```bash
# Start all services (web server + CSS compilation)
bin/dev

# Or start services individually:
bin/rails server        # Web server
bin/rails tailwindcss:watch  # CSS compilation in watch mode
```

### Database Operations
```bash
# Setup database
bin/rails db:setup

# Run migrations
bin/rails db:migrate

# Reset database
bin/rails db:reset

# Seed database
bin/rails db:seed
```

### Testing
```bash
# Run all tests
bin/rails test

# Run system tests
bin/rails test:system

# Run specific test
bin/rails test test/path/to/specific_test.rb
```

### Code Quality
```bash
# Run RuboCop (Ruby linting)
bundle exec rubocop

# Auto-fix RuboCop issues
bundle exec rubocop -a

# Run Brakeman (security analysis)
bundle exec brakeman
```

### Asset Management
```bash
# Compile Tailwind CSS
bin/rails tailwindcss:build

# Precompile assets for production
bin/rails assets:precompile
```

## Application Architecture

### Database Configuration
The application uses PostgreSQL with a multi-database setup:
- **Primary**: Main application data (`mi_precio_production`)
- **Cache**: Rails cache store (`mi_precio_production_cache`)
- **Queue**: Background job queue (`mi_precio_production_queue`) 
- **Cable**: WebSocket connections (`mi_precio_production_cable`)

### Modern Rails Stack
- **Solid Queue**: Replaces traditional job queue solutions like Sidekiq
- **Solid Cache**: Database-backed caching instead of Redis
- **Solid Cable**: Database-backed Action Cable instead of Redis
- **Propshaft**: Modern asset pipeline replacing Sprockets
- **Import Maps**: JavaScript module management without bundling

### Frontend Architecture
- **Hotwire**: Uses Turbo for SPA-like navigation and Stimulus for JavaScript sprinkles
- **Tailwind CSS**: Utility-first CSS framework with watch mode compilation
- **PWA Ready**: Contains manifest and service worker templates in `app/views/pwa/`

### Project Structure
```
app/
├── controllers/          # Rails controllers
├── models/              # ActiveRecord models  
├── views/               # ERB templates
├── javascript/          # Stimulus controllers
├── assets/              # Images and compiled CSS
└── jobs/                # Background jobs

config/
├── environments/        # Environment-specific configs
├── initializers/        # App initialization code
└── routes.rb           # URL routing

db/
├── migrate/            # Database migrations
└── seeds.rb           # Sample data

test/                   # Test suite (Minitest)
```

## Key Files

- `Procfile.dev`: Defines development processes (web server + CSS compilation)
- `config/importmap.rb`: JavaScript module imports configuration
- `config/tailwind.config.js`: Tailwind CSS configuration
- `config/deploy.yml`: Kamal deployment configuration

## Development Workflow

1. **Starting Development**: Use `bin/dev` to start both web server and CSS compilation
2. **Database Changes**: Create migrations with `bin/rails generate migration`
3. **New Features**: Follow Rails conventions (Controller → Model → View)
4. **Styling**: Use Tailwind utility classes, watch mode compiles automatically
5. **JavaScript**: Add Stimulus controllers in `app/javascript/controllers/`
6. **Testing**: Write tests in appropriate test directories, use `bin/rails test`

## Important Notes

- This is a fresh Rails 8 application with minimal custom code currently implemented
- The application uses the new Rails 8 "SOLID" stack (Solid Queue, Cache, Cable)
- No authentication system is currently implemented
- Routes are mostly empty - core functionality needs to be developed
- The application is Docker-ready with Kamal for deployment