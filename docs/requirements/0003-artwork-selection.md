# Requirements: Artwork Selection - Global, Balanced, Pedagogical

**Status**: Draft
**Date**: 2026-02-28
**Related Design**: `docs/designs/0001-artwork-selection-criteria.md`

---

## Objective

Select **328 artworks** (200 paintings, 64 sculptures, 64 architectures) using transparent, reproducible criteria that prioritize **global representation, historical breadth, cultural significance, and pedagogical value** over traditional Western-centric "greatest hits" lists.

**Target dataset**: Balanced across geography, time periods, movements, and artist demographics.

---

## Acceptance Criteria

### AC1: Total Count & Distribution

- ✅ **Total**: Exactly 328 artworks
  - 200 paintings (61%)
  - 64 sculptures (19.5%)
  - 64 architectures (19.5%)

- ✅ **Distribution rationale**:
  - Paintings majority (most accessible, broad historical range)
  - Sculptures & architecture equal (both 3D forms, comparable pedagogical value)

### AC2: Geographic Diversity (Paintings)

Target percentages (not strict quotas, but goals):

- ✅ **Western Europe**: 35% (70 works)
  - Italy, France, Netherlands, Spain, Germany, UK
  - Accounts for Renaissance, Baroque, Impressionism density

- ✅ **North America**: 20% (40 works)
  - USA, Mexico, Canada
  - Modern/contemporary art strength

- ✅ **Asia**: 20% (40 works)
  - China, Japan, India, Persia, Korea, Southeast Asia
  - Ancient → contemporary traditions

- ✅ **Eastern Europe/Russia**: 10% (20 works)
  - Icons, Constructivism, modern movements

- ✅ **Africa**: 7% (14 works)
  - Ancient Egypt, West Africa, Ethiopia, contemporary diaspora

- ✅ **Latin America** (beyond Mexico): 5% (10 works)
  - Brazil, Colombia, Cuba, Chile, Argentina

- ✅ **Oceania/Indigenous**: 3% (6 works)
  - Aboriginal Australian, Māori, Pacific Island, Indigenous American

**Validation**: Sum ≥40% non-Western works (corrects Eurocentric canon bias)

### AC3: Temporal Distribution (Paintings)

- ✅ **Pre-1400** (Medieval, Byzantine, early Asian): 10% (20 works)
- ✅ **1400-1700** (Renaissance, Baroque, Ming/Qing): 25% (50 works)
- ✅ **1700-1850** (Rococo, Neoclassicism, Romanticism): 15% (30 works)
- ✅ **1850-1945** (Impressionism → early Modernism): 30% (60 works)
- ✅ **1945-2020s** (Contemporary): 20% (40 works)

**Validation**: No single period dominates (avoid Impressionism over-representation)

### AC4: Movement Representation (Paintings)

Major movements must be represented by 4-8 exemplars each:

- ✅ Renaissance (Italian, Northern): 15-20 works
- ✅ Baroque: 8-10 works
- ✅ Romanticism: 8-10 works
- ✅ Impressionism: 12-15 works
- ✅ Post-Impressionism: 8-10 works
- ✅ Cubism: 6-8 works
- ✅ Expressionism: 6-8 works
- ✅ Surrealism: 6-8 works
- ✅ Abstract Expressionism: 6-8 works
- ✅ Pop Art: 4-6 works
- ✅ Minimalism/Conceptual: 4-6 works
- ✅ Non-Western traditions (ink painting, miniatures, etc.): 20-25 works

**Validation**: All canonical movements covered, no single movement >8% of total

### AC5: Gender Diversity

- ✅ **Target**: 25-30% women artists (50-60 works total)
  - Acknowledges historical barriers to women in art
  - Corrects male-dominated canon

- ✅ **Distribution across periods**:
  - Pre-1850: Limited (due to historical access barriers)
  - 1850-1945: 15-20 women artists (Impressionism, Modernism)
  - 1945-2020s: 30-40 women artists (Contemporary majority)

**Validation**: At least 50 women artists represented in final list

### AC6: Scoring Methodology

Each artwork scored (0-10) across 5 weighted dimensions:

1. **Historical Significance** (30%): Watershed moments, movement-defining works
2. **Cultural Impact** (25%): Global recognition, cultural transcendence
3. **Technical Innovation** (20%): Pioneering techniques, formal breakthroughs
4. **Pedagogical Value** (15%): Teaches key concepts, exemplifies movements
5. **Diversity Contribution** (10%): Corrects for underrepresented regions/artists

**Weighted Score Formula**:
```
Score = (HistoricalSig × 0.30) + (CulturalImpact × 0.25) +
        (TechInnovation × 0.20) + (PedagogicalValue × 0.15) +
        (DiversityBonus × 0.10)
```

**Thresholds**:
- ✅ All works score ≥6.0 (minimum quality bar)
- ✅ 60% score ≥7.5 (canonical works)
- ✅ 40% score 6.0-7.5 (important but less famous)

### AC7: Artist Representation Limits

- ✅ **Max 3-4 works per artist** (prevents single-artist domination)
  - Exception: Picasso, Monet may have 3-4 (justify in docs)
- ✅ **No artist series redundancy**: For series (Monet's Haystacks, Warhol's Marilyns), include 1 representative work only

**Validation**: Count artworks per artist, flag any >4

### AC8: Data Quality & Availability

- ✅ **High-quality images required**:
  - Wikimedia Commons preferred (free, high-res)
  - Museum collection pages (MoMA, Met, Louvre, etc.)
  - Minimum resolution: 1000px on longest edge

- ✅ **Metadata completeness**:
  - Title, artist, year (or date range)
  - Medium, dimensions (if available)
  - Current location (museum or site)
  - Source URL (Wikipedia, museum page)

- ✅ **Fallback for unavailable data**:
  - Accept lower-res images if culturally critical work
  - Mark missing metadata as "Unknown" (do not exclude work)

### AC9: Selection Process

**Phase 1: Seed List (Manual)**
- ✅ ~100 "indisputable" works (scoring 9-10 on Historical Significance)
- ✅ Documented in `data/seed-list-canonical-works.md`

**Phase 2: LLM-Assisted Generation (Gemini)**
- ✅ Structured prompts for each gap (women artists, regions, periods, movements)
- ✅ JSON output format (title, artist, year, location, scores, rationale)
- ✅ Candidate pool: ~500-600 works generated

**Phase 3: Scoring & Ranking**
- ✅ Apply weighted scoring formula
- ✅ Rank within each stratum (region × period)
- ✅ Automated scoring validation

**Phase 4: Stratification & Balancing**
- ✅ Apply geographic, temporal, movement quotas
- ✅ Enforce gender diversity targets
- ✅ Manual review for coherence

**Phase 5: Final List**
- ✅ Exactly 328 works selected
- ✅ Export to JSON: `data/artworks-final.json`
- ✅ Include metadata, scores, selection rationale

---

## Constraints

### Quality Constraints

- **Accuracy over quantity**: Prefer fewer, well-documented works over inflating count with weak candidates
- **No filler**: Every work must score ≥6.0 (no "quota-filling" with mediocre works)
- **Pedagogical coherence**: Works should collectively teach art history (not random assortment)

### Data Constraints

- **Public domain/fair use**: Images must be legally usable (Wikimedia Commons, museum open access)
- **No paid sources**: Avoid artworks only available via paid databases
- **Reproducibility**: Selection process must be documented, replicable

### Technical Constraints

- **LLM API limits**: Rate limiting (1 req/sec), batch processing
- **Manual review required**: Final list needs human curation (not fully automated)
- **Version control**: Track selection rationale, changes over time

---

## Non-Goals

### Out of Scope

- ❌ **User-customizable selections**: Fixed 328 works (no user uploads, substitutions)
- ❌ **Dynamic updates**: No "trending" or "recently added" artworks
- ❌ **Crowdsourced voting**: No community-driven selection
- ❌ **Commercial art market**: Exclude works valued solely for market price (not cultural significance)

### Explicitly Not Required

- Exhaustive coverage of every artist/movement
- Equal representation (some regions/periods have fewer significant works)
- Living artist curation (contemporary art is included but not prioritized over historical)

---

## Success Metrics

### Diversity Metrics

- ✅ **Geographic**: 40%+ non-Western works
- ✅ **Gender**: 25-30% women artists
- ✅ **Temporal**: All major periods represented (no gaps)
- ✅ **Movement**: All canonical movements covered (4-8 works each)

### Quality Metrics

- ✅ **Average score**: ≥7.0 (weighted average across all 328)
- ✅ **Score distribution**: 60% high (≥7.5), 40% medium (6.0-7.4)
- ✅ **Data completeness**: 100% have title, artist, year, image; 90%+ have full metadata

### Pedagogical Metrics

- ✅ **Art history coverage**: User can learn comprehensive art history from this collection
- ✅ **Technical diversity**: Various mediums, styles, techniques represented
- ✅ **Cultural breadth**: User exposed to global art traditions (not just Western canon)

---

## Open Questions

1. **Contemporary living artists**: Include (Kusama, Hirst, Koons) or cap at deceased artists only?
   - **Recommendation**: Include established living artists (50+ years old, major museum representation)

2. **Controversial works**: Include historically significant but problematic works (Nazi propaganda, colonial depictions)?
   - **Recommendation**: Include with critical commentary (especially in Social Impact, Philosophy dimensions)

3. **Museum accessibility**: Prioritize works in major museums (easier images/metadata) or cultural significance regardless?
   - **Recommendation**: 80% museum-accessible, 20% culturally critical (accept lower-res if needed)

4. **Artist duplication**: For prolific artists (Picasso, Monet), how to select which 3-4 works?
   - **Recommendation**: Prioritize diversity within artist's oeuvre (early/middle/late periods, different styles)

5. **Series handling**: Monet's Haystacks, Warhol's Marilyns - one representative or multiple?
   - **Recommendation**: One representative per series (avoid redundancy)

**Decisions needed before finalizing selection.**

---

## Example Selection Rationale

**Artwork**: The Starry Night
**Artist**: Vincent van Gogh
**Year**: 1889

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Historical Significance | 9 | Defining Post-Impressionist work, influenced Expressionism |
| Cultural Impact | 10 | One of most recognized images globally, cultural icon |
| Technical Innovation | 8 | Expressive brushwork, color theory, emotional intensity |
| Pedagogical Value | 9 | Teaches Post-Impressionism, artist psychology, modern art |
| Diversity Contribution | 0 | Western European male artist (no diversity bonus) |

**Weighted Score**: (9×0.3) + (10×0.25) + (8×0.2) + (9×0.15) + (0×0.1) = **8.65/10**

**Inclusion**: ✅ Yes (high score, canonical work, museum-accessible)

---

## Data Output Format

**File**: `data/artworks-final.json`

**Schema**:
```json
{
  "artworks": [
    {
      "id": 1,
      "title": "The Starry Night",
      "artist": "Vincent van Gogh",
      "year": 1889,
      "category": "painting",
      "medium": "Oil on canvas",
      "dimensions": "73.7 cm × 92.1 cm",
      "location": "Museum of Modern Art, New York",
      "region": "Western Europe",
      "period": "1850-1945",
      "movement": "Post-Impressionism",
      "imageUrl": "https://commons.wikimedia.org/wiki/File:...",
      "wikiUrl": "https://en.wikipedia.org/wiki/The_Starry_Night",
      "museumUrl": "https://www.moma.org/collection/works/79802",
      "scores": {
        "historicalSignificance": 9,
        "culturalImpact": 10,
        "technicalInnovation": 8,
        "pedagogicalValue": 9,
        "diversityContribution": 0,
        "weighted": 8.65
      },
      "selectionRationale": "Canonical Post-Impressionist work, globally recognized, high pedagogical value"
    }
  ]
}
```

---

## References

- Design document: `docs/designs/0001-artwork-selection-criteria.md`
- Seed list: `data/seed-list-canonical-works.md`
- Gap analysis: `data/selection-gap-analysis.md`
- System design principles: `docs/protocols/system-design-principles.md`
