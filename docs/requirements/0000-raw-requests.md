# Requirements: Local Art Memory Atlas

## Objective
Build a local-first web app that helps memorize major artworks and develop high-dimensional commentary (art + history + social context + economics + psychology + philosophy). The system must be automation-first: dataset selection, crawling, image download, metadata normalization, relationship inference, review scheduling, and UI rendering are all generated from scripts and SQLite.

## Acceptance Criteria
- Exactly 200 paintings, 64 sculptures, and 64 architectures in SQLite.
- End-to-end pipeline runs locally and deterministically from scripts.
- Data sources can use Wikimedia APIs, or any available APIs, but we should use Gemini to determine the 328 artworks, let integrate with Gemini API
- Images can be downloaded from the Internet
- Each stored image has author/creator, credit line, source URL, and Commons file page.
- Review scheduling yields 5–10 works/day by default and adapts via SM-2 style updates.
- UI includes Home dashboard, Browse library, Work detail, and Review mode, with fast search, dark mode, keyboard shortcuts, and responsive layout, must be fancy and modern

## Constraints
- Node.js + SQLite; local run only.
- Prefer Next.js + React + Tailwind + shadcn/ui-style components.
- Avoid paid APIs; use public endpoints like Wikimedia.
- Maintain reproducible selection with transparent scoring and stratification.
- Rate limit and cache API calls by URL for stability and speed.

## Non-Goals
- No cloud deployment or multi-user auth.
- No paid data sources or proprietary image pipelines.
- No manual curation beyond running scripts.
