# Prompt: Art Era Introduction Generator

Generate a comprehensive, educational introduction for the following art historical era.

## Era Details

- **Name:** {era_name}
- **Time Period:** {start_year} - {end_year}
- **Geographic Scope:** {regions}

## Requirements

### Length
- **Total:** 200-300 words
- Clear, accessible prose for general audiences
- No academic jargon without explanation

### Structure

1. **Historical Context** (50-75 words)
   - Geographic and temporal scope
   - Political, social, or cultural conditions
   - Key historical events shaping the period

2. **Defining Characteristics** (75-100 words)
   - Visual and technical features unique to this era
   - Artistic innovations or breakthroughs
   - Philosophical, religious, or cultural themes
   - Materials and techniques commonly used

3. **Major Artists & Works** (50-75 words)
   - 3-5 prominent artists with birth/death years
   - Representative masterpieces
   - Brief note on their significance

4. **Cultural Impact** (25-50 words)
   - Influence on subsequent art movements
   - Lasting legacy in art history
   - Contemporary relevance (if applicable)

### Tone & Style
- Educational but engaging
- Factual and objective
- No superlatives without evidence
- Active voice preferred
- Present tense for descriptions of artworks

### Accuracy Standards
- **DO:** Use specific dates, names, places
- **DO:** Reference verifiable historical facts
- **DO:** Connect art to broader cultural context
- **DON'T:** Make unsourced claims
- **DON'T:** Use vague phrases like "some believe" or "it is said"
- **DON'T:** Apply modern perspectives anachronistically

## Output Format

Return a Markdown document with the following structure:

```markdown
---
id: {era_id}
name: {era_name}
dateRange: "{start_year} - {end_year}"
generatedAt: "{iso_timestamp}"
model: "{model_name}"
promptVersion: "era-introduction-v1"
---

# {Era Name} ({Years})

## Historical Context

[50-75 words describing the time period, geography, and conditions that shaped this era]

## Defining Characteristics

[75-100 words on visual features, techniques, themes, and innovations]

- [Key visual feature #1]
- [Key innovation #2]
- [Philosophical/cultural theme #3]

## Major Artists & Works

- **Artist Name** (birth-death): Notable work(s) and brief significance
- **Artist Name** (birth-death): Notable work(s) and brief significance
- **Artist Name** (birth-death): Notable work(s) and brief significance

## Cultural Impact

[25-50 words on influence and legacy]

## Sources

- Wikipedia: https://en.wikipedia.org/wiki/{relevant_article}
- [Additional authoritative sources]
```

## Example (for reference only)

**Input:**
- Name: Renaissance
- Years: 1400 - 1600
- Regions: Italy, Northern Europe

**Output:**

```markdown
---
id: renaissance
name: Renaissance
dateRange: "1400 - 1600"
generatedAt: "2026-03-01T10:00:00Z"
model: "gemini-1.5-pro"
promptVersion: "era-introduction-v1"
---

# Renaissance (1400 - 1600)

## Historical Context

The Renaissance emerged in 14th-century Italy, marking a cultural rebirth after the Middle Ages. Wealthy merchant families like the Medici patronized arts and learning, while the rediscovery of classical Greek and Roman texts fueled humanism. This period coincided with the fall of Constantinople (1453), the invention of the printing press, and European exploration.

## Defining Characteristics

Renaissance art is defined by linear perspective, creating depth and realism. Artists studied human anatomy, achieving naturalistic proportions and expressions. Themes shifted from purely religious to include mythology, portraiture, and secular subjects. Oil painting techniques allowed for subtle color gradations and luminosity.

- Linear perspective and mathematical proportion
- Anatomical accuracy through direct observation
- Balance between religious devotion and human dignity (humanism)
- Sfumato, chiaroscuro, and other tonal techniques

## Major Artists & Works

- **Leonardo da Vinci** (1452-1519): *Mona Lisa*, *The Last Supper*; master of sfumato and scientific observation
- **Michelangelo Buonarroti** (1475-1564): *David*, Sistine Chapel ceiling; sculptor and painter of monumental human form
- **Raphael Sanzio** (1483-1520): *School of Athens*; epitome of High Renaissance harmony
- **Jan van Eyck** (c.1390-1441): *Arnolfini Portrait*; Northern Renaissance pioneer of oil painting detail

## Cultural Impact

The Renaissance established principles of realism, perspective, and humanism that dominated Western art until the 19th century. Its revival of classical ideals influenced architecture, literature, and science, shaping the modern world's emphasis on individualism and empirical inquiry.

## Sources

- Wikipedia: https://en.wikipedia.org/wiki/Renaissance
- The Metropolitan Museum of Art: Renaissance Art
```

## Important Notes

- Do NOT copy the example verbatim—generate original content
- Adapt tone and focus to the specific era requested
- For non-European eras (Mughal, Edo, etc.), avoid Eurocentric framing
- If unsure of a fact, omit it rather than speculate
- Include 2-3 authoritative sources in the Sources section
