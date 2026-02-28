# Learning Art

A local-first web application for memorizing major artworks and developing multi-dimensional commentary across art, history, social context, economics, psychology, and philosophy.

## Overview

Learning Art helps you systematically study and remember the world's greatest artworks using spaced repetition and deep, multi-dimensional analysis. The system is fully automated, with LLM-powered artwork selection, metadata enrichment, commentary generation, review scheduling, and a beautiful web interface.

**Target dataset**: 200 paintings, 64 sculptures, 64 architectures (328 total masterworks)

## Features

- **Curated Collection**: LLM-selected artworks based on historical significance, cultural impact, and aesthetic value
- **Smart Learning**: SM-2 spaced repetition algorithm adapts to your memory for optimal retention
- **Multi-Dimensional Commentary**: 6-dimension analysis covering:
  - Art & Technique - Visual analysis and formal elements
  - Historical Context - Creation circumstances and reception
  - Social & Cultural Impact - Influence and meaning over time
  - Economics - Patronage, sales, and market value
  - Psychology - Artist's state and viewer response
  - Philosophy - Existential themes and aesthetic questions
- **Wabi-Sabi Aesthetic**: Minimalist, calm design with natural colors and generous whitespace
- **Keyboard-First**: Comprehensive keyboard shortcuts for fast navigation
- **Fully Accessible**: WCAG 2.1 AA compliant with screen reader support

## Tech Stack

- **Runtime**: Node.js 18+
- **Database**: SQLite (local-only, no cloud)
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **API Integration**: Gemini API (artwork selection), Wikimedia Commons (images/metadata)
- **Review Algorithm**: SM-2 spaced repetition

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Gemini API key (free tier) - [Get one here](https://ai.google.dev/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/learning-art.git
cd learning-art

# Install dependencies (root and web app)
npm install
cd web && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**Or use Make:**

```bash
# Install dependencies
make install

# Quick start (install + migrate + run)
make start
```

### Database Setup

```bash
# Run database migrations
npx tsx scripts/migrate.ts

# Load initial artworks (10 masterworks for testing)
npx tsx scripts/load_artworks.ts
```

**Or use Make:**

```bash
make migrate
make load
```

### Run the Web App

```bash
cd web
npm run dev
```

**Or use Make:**

```bash
make run
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Development Commands (Makefile)

For convenience, a Makefile is provided with common development tasks:

```bash
make help        # Show all available commands
make test        # Run all tests (unit + type check + lint)
make run         # Start development server
make build       # Build for production
make clean       # Remove build artifacts
```

See `make help` for the complete list of commands.

## Usage

### Web Interface

- **Home**: View your progress stats and today's review queue
- **Browse**: Explore the complete artwork collection in a responsive grid
- **Review**: Study artworks due for review today using the SM-2 algorithm
- **Artwork Detail**: View large images, metadata, and multi-dimensional commentary

### Keyboard Shortcuts

Press `?` anywhere to see all available shortcuts.

**Global Navigation:**
- `g` + `h` - Go to Home
- `g` + `b` - Go to Browse
- `g` + `r` - Go to Review
- `Esc` - Go back

**Artwork View:**
- `←` / `→` - Previous/Next artwork
- `j` / `k` - Scroll down/up

**Help:**
- `?` - Show keyboard shortcuts overlay

### Generating Commentary

```bash
# Generate commentary for a single artwork
npx tsx scripts/generate_commentary.ts --id 1

# Generate commentary for all artworks
npx tsx scripts/generate_commentary.ts --all --delay 2000

# Force regenerate existing commentary
npx tsx scripts/generate_commentary.ts --all --force

# Generate for specific category
npx tsx scripts/generate_commentary.ts --category paintings
```

### Review Schedule

The SM-2 algorithm automatically schedules reviews based on your performance:
- **Easy**: Next review in 10+ days
- **Medium**: Next review in 3-6 days
- **Hard**: Review again tomorrow

Reviews are tracked in the database and update automatically as you study.

## Project Structure

```
learning-art/
├── data/                    # SQLite database and commentary files
│   ├── artworks.db         # Main database
│   └── commentary/         # Markdown commentary files
├── docs/                   # Documentation
│   ├── requirements/       # Feature requirements
│   ├── designs/           # Design documents
│   ├── execution-plans/   # Implementation plans
│   └── protocols/         # Development protocols
├── migrations/            # Database migrations
├── scripts/              # Automation scripts
│   ├── lib/             # Shared libraries
│   ├── prompts/         # LLM prompts
│   ├── migrate.ts       # Database migration runner
│   ├── load_artworks.ts # Artwork loader
│   ├── generate_commentary.ts  # Commentary generator
│   └── schedule_reviews.ts     # Review scheduler
└── web/                 # Next.js web application
    ├── app/             # Next.js App Router pages
    ├── components/      # React components
    ├── lib/            # Utility functions
    └── public/         # Static assets
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx tsx scripts/lib/sm2.test.ts
```

### Building for Production

```bash
cd web
npm run build
npm start
```

### Code Quality

```bash
# Type checking
cd web && tsc --noEmit

# Linting
cd web && npm run lint

# Format code
npx prettier --write "**/*.{ts,tsx,md}"
```

## Documentation

- **Requirements**: See `docs/requirements/` for feature specifications
- **Design Docs**: See `docs/designs/` for architecture decisions
- **Execution Plans**: See `docs/execution-plans/` for implementation steps
- **System Principles**: See `docs/protocols/system-design-principles.md`
- **Working Protocols**: See `docs/protocols/working-protocols.md`

## Contributing

This project follows strict development protocols. Please read `docs/protocols/working-protocols.md` before contributing.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the working protocols for your task size (Small/Medium/Large)
4. Commit your changes with descriptive messages
5. Push to your branch and open a Pull Request

## License

MIT

## Acknowledgments

- Artwork data from Wikimedia Commons
- Commentary generation powered by Claude (Anthropic)
- Artwork selection powered by Gemini (Google)
- Inspired by the wabi-sabi aesthetic philosophy
