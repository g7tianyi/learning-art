# Learning Art - Makefile
# Development workflow automation

.PHONY: help install migrate test run build clean lint typecheck test-sm2

# Default target - show help
help:
	@echo "Learning Art - Available Commands"
	@echo "=================================="
	@echo ""
	@echo "Setup & Dependencies:"
	@echo "  make install      Install all dependencies (root + web)"
	@echo "  make migrate      Run database migrations"
	@echo ""
	@echo "Development:"
	@echo "  make run          Start Next.js dev server (http://localhost:3000)"
	@echo "  make test         Run all tests (unit + type check + lint)"
	@echo "  make test-sm2     Run SM-2 algorithm unit tests only"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         Run ESLint on web app"
	@echo "  make typecheck    Run TypeScript type checking"
	@echo ""
	@echo "Build:"
	@echo "  make build        Build Next.js app for production"
	@echo "  make clean        Remove build artifacts and node_modules"
	@echo ""
	@echo "Data Pipeline:"
	@echo "  make load         Load artworks from JSON into database"
	@echo "  make commentary   Generate commentary for artwork (use ID=<id>)"
	@echo ""

# Install dependencies (root + web)
install:
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing web dependencies..."
	cd web && npm install
	@echo "✓ All dependencies installed"

# Run database migrations
migrate:
	@echo "Running database migrations..."
	npx tsx scripts/migrate.ts
	@echo "✓ Migrations complete"

# Run all tests
test: test-sm2 typecheck lint
	@echo "✓ All tests passed"

# Run SM-2 algorithm unit tests
test-sm2:
	@echo "Running SM-2 algorithm unit tests..."
	npx tsx scripts/lib/sm2.test.ts

# Run TypeScript type checking
typecheck:
	@echo "Running TypeScript type checking..."
	cd web && npx tsc --noEmit

# Run ESLint
lint:
	@echo "Running ESLint..."
	cd web && npm run lint

# Start Next.js development server
run:
	@echo "Starting Next.js development server..."
	@echo "Visit http://localhost:3000"
	cd web && npm run dev

# Build Next.js app for production
build:
	@echo "Building Next.js app for production..."
	cd web && npm run build
	@echo "✓ Build complete"

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning build artifacts..."
	rm -rf web/.next
	rm -rf web/node_modules
	rm -rf node_modules
	rm -rf data/artworks.db
	@echo "✓ Clean complete"

# Load artworks into database
load:
	@echo "Loading artworks into database..."
	npx tsx scripts/load_artworks.ts
	@echo "✓ Artworks loaded"

# Generate commentary for artwork (use: make commentary ID=1)
commentary:
	@echo "Generating commentary for artwork ID=$(ID)..."
	npx tsx scripts/generate_commentary.ts --id $(ID)
	@echo "✓ Commentary generated"

# Quick start (install + migrate + run)
start: install migrate
	@echo ""
	@echo "✓ Setup complete! Starting development server..."
	@echo ""
	$(MAKE) run
