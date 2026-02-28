# Artwork Selection Criteria & Methodology

**Status**: Draft
**Date**: 2026-02-28
**Purpose**: Define transparent, reproducible criteria for selecting 328 artworks (200 paintings, 64 sculptures, 64 architectures)

---

## 1. Selection Philosophy

**Core Principle**: Build a **globally representative, historically comprehensive** collection that balances canonical masterworks with culturally diverse voices.

**Anti-Goals**:
- ❌ Eurocentric "greatest hits" list
- ❌ Recency bias (over-representing contemporary art)
- ❌ Gender/cultural homogeneity
- ❌ Single-movement clustering (e.g., 80 Impressionist paintings)

**Success Criteria**:
- ✅ Geographic diversity: All continents represented
- ✅ Temporal breadth: Ancient → Contemporary (3000 BCE - 2020s)
- ✅ Movement coverage: Major art movements proportionally represented
- ✅ Cultural significance: Works that shaped art history or cultural discourse
- ✅ Technical diversity: Various mediums, styles, techniques
- ✅ Pedagogical value: Works that teach important concepts/contexts

---

## 2. Scoring Dimensions (Weighted)

Each artwork candidate receives scores (0-10) across these dimensions:

### A. Historical Significance (Weight: 30%)
- **9-10**: Watershed works that defined movements or changed art history
  - Examples: Les Demoiselles d'Avignon (Picasso), Fountain (Duchamp), Impression Sunrise (Monet)
- **7-8**: Major works within established movements
- **5-6**: Representative works of significant artists
- **3-4**: Notable but not essential
- **0-2**: Minor works

### B. Cultural Impact (Weight: 25%)
- **9-10**: Globally recognized, transcended art world (Mona Lisa, Starry Night, Guernica)
- **7-8**: Widely known within educated audiences
- **5-6**: Influential within specific cultural contexts
- **3-4**: Regional significance
- **0-2**: Limited impact

### C. Technical/Artistic Innovation (Weight: 20%)
- **9-10**: Pioneering technique, material, or formal approach
  - Examples: Pollock's drip paintings, Gothic cathedrals, Benin Bronzes
- **7-8**: Masterful execution advancing existing techniques
- **5-6**: Competent demonstration of techniques
- **3-4**: Derivative
- **0-2**: Unremarkable technique

### D. Pedagogical Value (Weight: 15%)
- **9-10**: Exemplifies key concept (perspective, color theory, minimalism, etc.)
- **7-8**: Useful teaching example for movement/period
- **5-6**: Representative but not essential for teaching
- **3-4**: Narrow applicability
- **0-2**: Limited learning value

### E. Diversity Contribution (Weight: 10%)
- **Bonus points** for:
  - Underrepresented regions (Africa, Asia, Latin America, Oceania, Indigenous cultures)
  - Women artists
  - Non-Western artistic traditions
  - Contemporary/20th-21st century diversity

**Note**: This is NOT tokenism - these works must still score highly on other dimensions. This weight corrects for historical biases in art canon formation.

---

## 3. Stratification Rules

To ensure balanced coverage, enforce quotas:

### Geographic Distribution (Target %)

**Paintings (200 total)**:
- Western Europe: 35% (70 works) - Italy, France, Netherlands, Spain, Germany, UK
- North America: 20% (40 works) - USA, Mexico, Canada
- Asia: 20% (40 works) - China, Japan, India, Persia, Korea
- Eastern Europe/Russia: 10% (20 works)
- Africa: 7% (14 works) - Egypt, West Africa, Ethiopia, contemporary
- Latin America: 5% (10 works) - Beyond Mexico
- Oceania/Indigenous: 3% (6 works)

**Sculptures (64 total)**:
- Ancient (Egypt, Greece, Rome, Mesopotamia): 20% (13 works)
- Asia (China, India, Japan, Southeast Asia): 25% (16 works)
- Africa: 15% (10 works)
- Western Europe: 25% (16 works)
- Americas (Pre-Columbian, contemporary): 10% (6 works)
- Modern/Contemporary (global): 5% (3 works)

**Architecture (64 total)**:
- Ancient (Egypt, Greece, Rome, Mesopotamia): 20% (13 works)
- Islamic: 15% (10 works)
- Asian (China, Japan, India, Southeast Asia): 20% (13 works)
- Medieval/Gothic Europe: 15% (10 works)
- Renaissance-Baroque Europe: 10% (6 works)
- Modern/Contemporary (global): 20% (12 works)

### Temporal Distribution

**Paintings**:
- Pre-1400 (Medieval, Byzantine, early Asian): 10% (20)
- 1400-1700 (Renaissance, Baroque, Ming/Qing): 25% (50)
- 1700-1850 (Rococo, Neoclassicism, Romanticism): 15% (30)
- 1850-1945 (Impressionism → early Modernism): 30% (60)
- 1945-2020s (Contemporary): 20% (40)

**Sculptures**:
- Ancient (3000 BCE - 500 CE): 30% (19)
- Classical-Medieval (500-1400): 20% (13)
- Renaissance-Baroque (1400-1750): 20% (13)
- Modern (1750-1945): 15% (10)
- Contemporary (1945-2020s): 15% (9)

**Architecture**:
- Ancient (3000 BCE - 500 CE): 25% (16)
- Medieval (500-1400): 20% (13)
- Renaissance-Baroque (1400-1750): 15% (10)
- Industrial-Modern (1750-1945): 20% (13)
- Contemporary (1945-2020s): 20% (12)

### Movement Representation (Paintings)

Ensure major movements are represented:
- Renaissance (Italian, Northern): 15-20 works
- Baroque: 8-10 works
- Romanticism: 8-10 works
- Impressionism: 12-15 works
- Post-Impressionism: 8-10 works
- Cubism: 6-8 works
- Expressionism: 6-8 works
- Surrealism: 6-8 works
- Abstract Expressionism: 6-8 works
- Pop Art: 4-6 works
- Minimalism/Conceptual: 4-6 works
- Contemporary (diverse): 10-15 works
- Non-Western traditions (ink painting, miniatures, etc.): 20-25 works

---

## 4. Selection Methodology

### Phase 1: Seed List (Manual)

Start with ~100 "indisputable" works - those scoring 9-10 on Historical Significance:

**Painting Examples**:
- Mona Lisa (da Vinci)
- The Starry Night (Van Gogh)
- Guernica (Picasso)
- The Birth of Venus (Botticelli)
- The Night Watch (Rembrandt)
- Impression, Sunrise (Monet)
- Along the River During Qingming Festival (Zhang Zeduan)
- The Great Wave off Kanagawa (Hokusai)
- etc.

**Sculpture Examples**:
- David (Michelangelo)
- Venus de Milo
- Terracotta Army
- Benin Bronzes
- Moai (Easter Island)
- The Thinker (Rodin)
- etc.

**Architecture Examples**:
- Pyramids of Giza
- Parthenon
- Hagia Sophia
- Taj Mahal
- Sagrada Familia
- Forbidden City
- etc.

### Phase 2: LLM-Assisted Generation (Gemini)

Use structured prompting to generate candidate lists:

**Prompt Template**:
```
Generate 50 candidate {category} artworks for period {period} from region {region}.

Requirements:
- Score each on: Historical Significance, Cultural Impact, Technical Innovation, Pedagogical Value
- Include artists' names, dates, current locations
- Explain why each is significant
- Ensure gender and cultural diversity within the region/period
- Avoid works already in seed list: [list]

Format as JSON with fields: title, artist, year, location, scores, rationale
```

### Phase 3: Stratification & Balancing

1. Aggregate all candidates (seed + LLM-generated)
2. Score each using weighted dimensions
3. Rank within each stratum (region × period)
4. Apply quotas to enforce diversity targets
5. Manual review for quality/coherence

### Phase 4: Validation

Check final list against:
- Geographic quotas met?
- Temporal distribution balanced?
- Movement representation adequate?
- Gender diversity: Target 25-30% women artists (acknowledging historical barriers)
- Cultural diversity: 40%+ non-Western works
- No single artist dominates (max 3-4 works per artist)

---

## 5. Example Scoring (Starry Night)

**Title**: The Starry Night
**Artist**: Vincent van Gogh
**Year**: 1889
**Category**: Painting

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Historical Significance | 9 | Defining Post-Impressionist work, influenced Expressionism |
| Cultural Impact | 10 | One of most recognized images globally, cultural icon |
| Technical Innovation | 8 | Expressive brushwork, color theory, emotional intensity |
| Pedagogical Value | 9 | Teaches Post-Impressionism, artist psychology, modern art |
| Diversity Contribution | 0 | Western European male artist |

**Weighted Score**: (9×0.3) + (10×0.25) + (8×0.2) + (9×0.15) + (0×0.1) = **8.65/10**

**Inclusion**: ✅ Yes (high score, canonical work)

---

## 6. Known Challenges

### Challenge 1: Western Canon Bias
- **Issue**: Most "art history" education focuses on European/American art
- **Mitigation**: Explicit geographic quotas, diversity weighting, research non-Western traditions

### Challenge 2: Availability of Images/Data
- **Issue**: Some culturally significant works lack high-quality images or metadata
- **Mitigation**: Prioritize works with Wikimedia Commons availability; accept lower-res if culturally critical

### Challenge 3: Contemporary Art Selection
- **Issue**: Harder to assess "historical significance" for recent works
- **Mitigation**: Emphasize Cultural Impact and Technical Innovation for contemporary; accept some recency bias

### Challenge 4: Architecture Definition
- **Issue**: What counts as "an architecture"? Single building? Complex? Style?
- **Mitigation**: Prioritize individual iconic buildings; allow some complexes (Forbidden City, Acropolis)

### Challenge 5: "Greatest Hits" vs. Deep Cuts
- **Issue**: Balancing recognizability with educational breadth
- **Mitigation**: 60-70% canonical works, 30-40% important but less famous works

---

## 7. Next Steps

1. **Create seed list** (~100 works) manually curated
2. **Implement LLM generation script** using Gemini API with structured prompts
3. **Score and rank** all candidates
4. **Apply stratification** to ensure quotas
5. **Manual review** for coherence and quality
6. **Generate metadata** for selected 328 works
7. **Document rationale** for each work's inclusion

---

## 8. Open Questions

1. Should we bias toward works physically accessible (major museums) vs. theoretical importance?
2. How to handle artist series (Monet's Haystacks, Warhol's Marilyns)? One representative or multiple?
3. Include controversial/problematic works for historical completeness? (e.g., Riefenstahl)
4. Weight toward works with existing high-quality commentary/scholarship?
5. Should contemporary living artists be included, or cap at a historical threshold?

**Decision needed before proceeding with selection.**
