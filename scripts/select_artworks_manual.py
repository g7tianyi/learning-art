#!/usr/bin/env python3

"""
Generate Additional Artworks (Avoiding Duplicates)

Generates missing artworks to reach targets, with deduplication awareness
"""

import os
import sys
import time
import json
import re
from datetime import datetime
from pathlib import Path
import google.generativeai as genai

# Configure proxy
os.environ["HTTP_PROXY"] = "http://127.0.0.1:7890"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7890"

# ============================================================================
# Configuration
# ============================================================================

# PASTE YOUR API KEY RIGHT HERE:
GEMINI_KEY = "ll45TAKKKBj6dsamkc6Q92vM"

CURRENT_DIR = Path(__file__).parent
INPUT_PATH = CURRENT_DIR.parent / "data" / "artworks-deduped.json"
OUTPUT_PATH = CURRENT_DIR.parent / "data" / "artworks-complete.json"

# FIX: Lowered batch size to prevent the LLM from truncating the JSON output mid-string
BATCH_SIZE = 10
DELAY_SECONDS = 2.0

# ============================================================================
# Category-Specific Suggestions to Encourage Diversity
# ============================================================================

def get_category_suggestions(category: str, existing_artists: set, batch_num: int) -> str:
    """Generate specific suggestions for the current batch to ensure variety"""

    suggestions_map = {
        "painting": [
            "Consider: Byzantine mosaics, Persian miniatures, Japanese woodblock prints, African masks/paintings",
            "Explore: Mughal court paintings, Chinese landscape scrolls, Aboriginal dot paintings",
            "Include: Women artists (Artemisia Gentileschi, Sofonisba Anguissola, Judith Leyster, Mary Cassatt, Georgia O'Keeffe)",
            "Add: Latin American muralists (Orozco, Siqueiros), African American artists (Bearden, Basquiat, Jacob Lawrence)",
            "Focus on: Ancient Egyptian tomb paintings, Roman frescoes, Medieval illuminated manuscripts",
            "Consider: Dutch Golden Age (Vermeer, Hals, Steen), Spanish Baroque (Zurbarán, Ribera), Flemish landscapes",
            "Explore: Russian avant-garde (Malevich, Kandinsky, Chagall), German Expressionism (Kirchner, Nolde)",
            "Include: Asian contemporary (Yoshitomo Nara, Yayoi Kusama, Liu Xiaodong), Korean Dansaekhwa",
            "Add: Indigenous Australian (Emily Kame Kngwarreye), Native American ledger art, Caribbean (Wifredo Lam)",
            "Focus on: Symbolism (Moreau, Redon), Pre-Raphaelites (Rossetti, Burne-Jones), Art Nouveau (Mucha, Klimt)",
            "Try: Northern Renaissance (Bosch, Bruegel), Venetian (Titian, Tintoretto), Mannerism (Parmigianino)",
            "Add: Rococo (Watteau, Boucher), American Scene (Hopper, Wood), Mexican Modernism (Tamayo, Kahlo)",
            "Explore: Fauvism (Vlaminck, Derain), Orphism (Delaunay), Vorticism (Wyndham Lewis)",
            "Include: Harlem Renaissance (Aaron Douglas), Socialist Realism (Deineka), Metaphysical (de Chirico)",
            "Focus on: Color Field (Rothko, Newman, Still), Hard-Edge (Ellsworth Kelly), Op Art (Bridget Riley)"
        ],
        "sculpture": [
            "Consider: Ancient Greek/Roman statues (Venus de Milo, Discobolus), Chinese terracotta, African bronze (Benin, Ife)",
            "Explore: Buddhist statues (Gandhara, Longmen Caves, Kamakura), Hindu temple sculpture (Khajuraho, Ellora)",
            "Include: Renaissance (Verrocchio, Cellini, Giambologna), Baroque (Algardi, Puget, Duquesnoy), Neoclassical (Thorvaldsen, Canova)",
            "Add: Modern abstract (Arp, Noguchi, David Smith, Anthony Caro), Minimalist (Judd, Andre, LeWitt)",
            "Focus on: Assyrian winged bulls, Egyptian sphinxes/Ka statues, Olmec colossal heads",
            "Consider: Medieval reliquaries, Romanesque tympanum (Moissac, Autun), Gothic portals (Chartres)",
            "Explore: Contemporary installations (Kapoor, Turrell, Eliasson), Land Art (Smithson, Heizer)",
            "Include: Women sculptors (Hepworth, Nevelson, Bourgeois, Hesse, Claudel)",
            "Add: Pacific (Easter Island Moai, Maori meeting houses), Pre-Columbian (Maya stelae, Aztec Sun Stone)",
            "Focus on: Constructivism (Tatlin, Gabo), Futurism (Boccioni), Surrealism (Giacometti, Miro)",
            "Try: Ancient Near East (Sumerian votive), Cycladic idols, Benin bronzes, Yoruba ibeji",
            "Add: Rococo (Clodion), Romantic (Rude, Barye), Realist (Carpeaux, Dalou)",
            "Explore: Pop Art (Oldenburg, Segal), Fluxus (Beuys), Process Art (Serra, Morris)",
            "Include: African contemporary (El Anatsui), Latin American (Botero), Asian (Xu Bing)"
        ],
        "architecture": [
            "Consider: Ancient temples (Parthenon, Pantheon, Karnak, Ziggurats of Ur)",
            "Explore: Islamic architecture (Dome of Rock, Alhambra, Süleymaniye, Great Mosque of Kairouan), Buddhist stupas (Borobudur, Shwedagon)",
            "Include: Gothic cathedrals (Reims, Amiens, Cologne, Salisbury), Romanesque (Cluny, Pisa, Durham)",
            "Add: Hindu temples (Angkor Wat, Brihadeeswarar, Khajuraho, Konark), Japanese shrines (Itsukushima, Ise, Byōdō-in)",
            "Focus on: Renaissance (Palazzo Medici, Palazzo Farnese, Villa Rotonda), Baroque (Versailles Chapel, Würzburg Residence)",
            "Consider: Chinese architecture (Temple of Heaven, Summer Palace), Japanese castles (Himeji, Matsumoto, Osaka)",
            "Explore: Art Nouveau (Casa Batlló, Victor Horta houses), Art Deco (Chrysler, Empire State, Hoover Dam)",
            "Include: Modernism (Bauhaus, Villa Tugendhat, Johnson Glass House), International Style (UN Headquarters, Lever House)",
            "Add: Brutalism (National Theatre London, Barbican, Habitat 67, Boston City Hall), High-Tech (Pompidou, Lloyd's)",
            "Focus on: Pre-Columbian (Chichen Itza, Machu Picchu, Teotihuacan, Palenque), African (Great Zimbabwe, Lalibela churches)",
            "Try: Byzantine (Hagia Sophia variations), Romanesque (St. Sernin Toulouse), Islamic (Cordoba Mosque, Alhambra)",
            "Add: Neoclassical (Monticello, Brandenburg Gate), Beaux-Arts (Paris Opera, Grand Central)",
            "Explore: Deconstructivism (Guggenheim Bilbao already exists, try: Vitra Fire Station, Jewish Museum Berlin)",
            "Include: Contemporary sustainable (Bosco Verticale, Edge Amsterdam), Parametric (Beijing National Stadium, Soumaya Museum)"
        ]
    }

    # Rotate through suggestions based on batch number
    suggestions_list = suggestions_map.get(category, ["Focus on canonical works from diverse regions and periods"])
    suggestion = suggestions_list[batch_num % len(suggestions_list)]

    return f"- {suggestion}\n- Avoid repeating artists already in collection: {', '.join(list(existing_artists)[:20])}"

# ============================================================================
# Enhanced Prompt with Existing Artworks Context
# ============================================================================

def build_enhanced_prompt(category: str, count: int, existing_artworks: list, batch_num: int) -> str:
    # Analyze existing works to find gaps
    existing_in_cat = [a for a in existing_artworks if a.get("category") == category]

    # Get regions and periods already covered
    existing_regions = {a.get("region", "").strip() for a in existing_in_cat if a.get("region")}
    existing_periods = {a.get("period", "").strip() for a in existing_in_cat if a.get("period")}
    existing_artists = {a.get("artist", "").strip() for a in existing_in_cat if a.get("artist")}

    # Define target regions/periods to encourage diversity
    target_regions = ["Western Europe", "East Asia", "South Asia", "Middle East", "Africa", "Latin America", "North America", "Oceania"]
    target_periods = ["Ancient", "Medieval", "Renaissance", "Baroque", "Neoclassicism", "Romanticism", "Realism", "Impressionism", "Modern", "Contemporary"]

    # Find underrepresented regions/periods
    underrep_regions = [r for r in target_regions if r not in existing_regions or sum(1 for a in existing_in_cat if a.get("region") == r) < 10]
    underrep_periods = [p for p in target_periods if p not in existing_periods or sum(1 for a in existing_in_cat if a.get("period") == p) < 10]

    # Get existing works (limit to 30 most recent to save tokens, rotate based on batch)
    start_idx = (batch_num * 15) % max(1, len(existing_in_cat))
    existing = [
        f'"{a.get("title")}" by {a.get("artist")}'
        for a in existing_in_cat[start_idx:start_idx+30]
    ]

    existing_str = "\n".join(f"{i + 1}. {w}" for i, w in enumerate(existing)) if existing else "None yet"

    # Build region/period targeting guidance
    region_guidance = f"\n**PRIORITIZE THESE UNDERREPRESENTED REGIONS:** {', '.join(underrep_regions[:5])}" if underrep_regions else ""
    period_guidance = f"\n**PRIORITIZE THESE UNDERREPRESENTED PERIODS:** {', '.join(underrep_periods[:5])}" if underrep_periods else ""

    # Suggest specific movements/styles based on category
    suggestions = get_category_suggestions(category, existing_artists, batch_num)

    return f"""You are an art history expert curator. Generate exactly {count} UNIQUE {category}s that are NOT already in our collection.

**BATCH #{batch_num + 1} - Focus on MAXIMUM VARIETY and UNIQUENESS**

**CRITICAL:** We already have {len(existing_in_cat)} {category}s. DO NOT repeat ANY works below:
{existing_str}

**STRATEGY:** Prioritize LESSER-KNOWN canonical works, not just famous masterpieces.
Think: second-tier artists from each period, regional variations, underrepresented cultures.
{region_guidance}{period_guidance}

**SPECIFIC SUGGESTIONS FOR THIS BATCH (USE THESE EXACT SUGGESTIONS):**
{suggestions}

**DIVERSITY MANDATE:**
- Each batch must include works from at least 5 different countries
- Include at least 2 non-Western works per batch of 10
- Include at least 1 woman artist (for painting/sculpture batches)
- Spread across at least 4 different time periods

**Selection Criteria (ranked):**
1. Historical significance (watershed moments, movement-defining)
2. Cultural impact (globally recognized, taught in universities)
3. Technical innovation (pioneering techniques)
4. Geographic diversity (MUST include non-Western: Islamic, Chinese, Indian, Persian, African, Latin American)
5. Temporal diversity (Ancient to Contemporary)
6. Artist diversity (include women artists, underrepresented cultures)

**Quality Standards:**
- Only canonical works from major art history textbooks
- Works in major museum collections or UNESCO sites
- Global representation (aim for 40%+ non-Western across full dataset)

**Diversity Requirements for this batch:**
- At least 40% should be non-Western works
- Include at least 20% women artists (for paintings/sculpture)
- Cover at least 5 different art historical periods
- No single artist should appear more than once

For EACH {category}, provide:
- title: Full artwork title (check it's NOT in the exclusion list above!)
- artist: Artist name (or "Unknown" for ancient works)
- year: Year or range (e.g., 1889 or "c. 1500" or -500 for BCE)
- category: "{category}"
- medium: Material/technique
- location: Current location (museum/site)
- region: Geographic region (Western Europe, East Asia, Middle East, South Asia, Africa, Latin America, North America, Oceania)
- period: Art historical period (Ancient, Medieval, Renaissance, Baroque, Neoclassicism, Romanticism, Realism, Impressionism, Modern, Contemporary)
- movement: Specific movement or style
- scores: Rate 0-10 for:
  - historicalSignificance
  - culturalImpact
  - technicalInnovation
  - pedagogicalValue
  - diversityContribution (0 for Western European males, 10 for underrepresented)
- selectionRationale: Why this work is canonical (1-2 sentences)

**IMPORTANT:**
- Triple-check that NONE of your selections appear in the exclusion list above
- Prioritize lesser-known canonical works to ensure uniqueness
- For architecture: temples, mosques, churches, palaces, monuments, modern buildings
- For sculpture: relief, free-standing, installations from all eras
- Return ONLY valid JSON array. NO trailing commas. NO markdown.

Example format:
[
  {{
    "title": "The Night Watch",
    "artist": "Rembrandt van Rijn",
    "year": 1642,
    "category": "{category}",
    "medium": "Oil on canvas",
    "location": "Rijksmuseum, Amsterdam",
    "region": "Western Europe",
    "period": "Baroque",
    "movement": "Dutch Golden Age",
    "scores": {{
      "historicalSignificance": 9,
      "culturalImpact": 9,
      "technicalInnovation": 8,
      "pedagogicalValue": 9,
      "diversityContribution": 0
    }},
    "selectionRationale": "Revolutionary group portrait showcasing dramatic use of light and shadow, defining work of the Dutch Golden Age taught in all art history surveys."
  }}
]"""

# ============================================================================
# Generation with Deduplication Check
# ============================================================================

def generate_batch(model: genai.GenerativeModel, category: str, count: int, existing_artworks: list, batch_num: int = 0) -> list:
    print(f"  Generating {count} {category}s (batch #{batch_num + 1}, avoiding {len(existing_artworks)} existing works)...")

    prompt = build_enhanced_prompt(category, count, existing_artworks, batch_num)
    
    # Vary temperature based on batch number for more diversity
    temperature = 0.85 + (batch_num % 3) * 0.05  # 0.85, 0.90, or 0.95

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=8192,
            top_p=0.95,
            top_k=64,
            response_mime_type="application/json"
        )
    )
    
    text = response.text

    # Cleanup markdown tags
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()

    # Remove trailing commas
    text = re.sub(r',\s*([\]}])', r'\1', text)

    try:
        artworks = json.loads(text, strict=False)

        if not isinstance(artworks, list):
            raise ValueError('Response is not an array')

        # Local deduplication check
        existing_keys = {
            f"{str(a.get('artist', '')).lower().strip()}:{str(a.get('title', '')).lower().strip()}"
            for a in existing_artworks
        }

        unique_new = []
        for artwork in artworks:
            key = f"{str(artwork.get('artist', '')).lower().strip()}:{str(artwork.get('title', '')).lower().strip()}"
            if key in existing_keys:
                print(f"    ⚠️  Skipping duplicate: \"{artwork.get('title')}\" by {artwork.get('artist')}")
                continue
            
            existing_keys.add(key)
            unique_new.append(artwork)

        print(f"  ✓ Generated {len(unique_new)}/{len(artworks)} unique {category}s")
        return unique_new

    except json.JSONDecodeError as err:
        print("  ✗ JSON Truncation Error (Model output was cut off). Retrying...")
        raise err
    except Exception as err:
        print(f"  ✗ Failed to parse JSON response: {err}")
        raise err

def generate_category(model: genai.GenerativeModel, category: str, target: int, existing: list) -> list:
    new_artworks = []
    attempts = 0
    consecutive_low_yield = 0  # Track if we're getting too many duplicates
    max_attempts = (target // BATCH_SIZE) + 20  # More attempts allowed

    print(f"\nGenerating {target} {category}s...")
    print(f"Existing {category}s: {len([a for a in existing if a.get('category') == category])}")
    print(f"Target new: {target}\n")

    while len(new_artworks) < target and attempts < max_attempts:
        attempts += 1
        remaining = target - len(new_artworks)

        # Adaptive batch sizing - request MORE to compensate for duplicates
        # As we get more works, we need to ask for more to account for likely duplicates
        duplicate_buffer = min(5, attempts // 3)  # Increase buffer as we go
        batch_size = min(BATCH_SIZE + duplicate_buffer, remaining + 5)  

        try:
            batch = generate_batch(
                model,
                category,
                batch_size,
                existing + new_artworks,
                batch_num=attempts - 1  # Pass batch number for variety
            )

            # Track yield quality
            yield_ratio = len(batch) / batch_size if batch_size > 0 else 0

            if yield_ratio < 0.5:  # Less than 50% unique
                consecutive_low_yield += 1
                print(f"  ⚠️  Low unique yield: {len(batch)}/{batch_size} ({yield_ratio*100:.1f}%)")
            else:
                consecutive_low_yield = 0

            # Add what we need
            to_add = batch[:remaining]
            new_artworks.extend(to_add)

            print(f"  Progress: {len(new_artworks)}/{target} {category}s completed ({len(batch)} unique from batch)")

            # If we're stuck with low yields, inject more specific guidance
            if consecutive_low_yield >= 3:
                print(f"  🔄 Adjusting strategy due to high duplicate rate...")
                consecutive_low_yield = 0  # Reset counter
                time.sleep(DELAY_SECONDS * 2)  # Longer wait before retry
            elif len(new_artworks) < target:
                print(f"  Waiting {DELAY_SECONDS}s before next batch...\n")
                time.sleep(DELAY_SECONDS)

        except Exception as err:
            retry_delay = DELAY_SECONDS * 2
            print(f"  Retrying in {retry_delay}s...")
            time.sleep(retry_delay)

    if len(new_artworks) < target:
        print(f"  ⚠️  Only generated {len(new_artworks)}/{target} - may need manual curation")

    return new_artworks

# ============================================================================
# Main Execution
# ============================================================================

def main():
    print("=" * 80)
    print("Generate Additional Artworks (Smart Deduplication)")
    print("=" * 80)
    print()

    # Load existing deduplicated artworks
    if not INPUT_PATH.exists():
        print(f"❌ Input file not found: {INPUT_PATH}")
        sys.exit(1)

    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        existing = data.get('artworks', [])

    print(f"[INFO] Loaded {len(existing)} existing unique artworks\n")

    by_cat = {
        "painting": [a for a in existing if a.get("category") == "painting"],
        "sculpture": [a for a in existing if a.get("category") == "sculpture"],
        "architecture": [a for a in existing if a.get("category") == "architecture"]
    }

    print("Current counts:")
    print(f"  Paintings: {len(by_cat['painting'])}/200")
    print(f"  Sculptures: {len(by_cat['sculpture'])}/64")
    print(f"  Architecture: {len(by_cat['architecture'])}/64\n")

    gaps = {
        "painting": max(0, 200 - len(by_cat["painting"])),
        "sculpture": max(0, 64 - len(by_cat["sculpture"])),
        "architecture": max(0, 64 - len(by_cat["architecture"]))
    }

    total_needed = sum(gaps.values())
    print(f"Total needed: {total_needed} artworks")
    print(f"  Paintings: {gaps['painting']}")
    print(f"  Sculptures: {gaps['sculpture']}")
    print(f"  Architecture: {gaps['architecture']}\n")

    if total_needed == 0:
        print("✓ No additional artworks needed!")
        return

    # Check API key
    if GEMINI_KEY == "YOUR_ACTUAL_API_KEY_HERE" or not GEMINI_KEY:
        print("❌ Error: You forgot to add your API key!")
        print("Please edit the script and replace 'YOUR_ACTUAL_API_KEY_HERE' on line 27 with your real Gemini API key.")
        sys.exit(1)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    genai.configure(api_key=GEMINI_KEY)
    # Use gemini-pro instead of 2.5-pro for better stability and availability
    model = genai.GenerativeModel('gemini-pro')
    
    all_new = []

    # Generate each category
    for category, gap in gaps.items():
        if gap == 0:
            continue

        print("=" * 80)
        new_works = generate_category(model, category, gap, existing)
        all_new.extend(new_works)
        print(f"✓ Completed {category}s: {len(new_works)} new works generated")

    # Combine with existing
    all_artworks = existing + all_new

    # Re-assign sequential IDs
    for index, artwork in enumerate(all_artworks):
        artwork['id'] = index + 1

    # Save
    output = {
        "metadata": {
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "totalArtworks": len(all_artworks),
            "model": "gemini-pro",
            "version": "3.0-enhanced",
            "originalCount": len(existing),
            "additionalGenerated": len(all_new),
            "enhancements": [
                "Smart deduplication with rotating exclusion lists",
                "Region/period gap analysis",
                "Category-specific suggestions per batch",
                "Temperature variation (0.85-0.95)",
                "Batch size: 10 artworks"
            ]
        },
        "artworks": all_artworks
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Final summary
    final_counts = {
        "painting": sum(1 for a in all_artworks if a.get("category") == "painting"),
        "sculpture": sum(1 for a in all_artworks if a.get("category") == "sculpture"),
        "architecture": sum(1 for a in all_artworks if a.get("category") == "architecture")
    }

    print("\n" + "=" * 80)
    print("Generation Complete!")
    print("=" * 80)
    print(f"Total artworks: {len(all_artworks)}")
    print(f"  Paintings: {final_counts['painting']}/200 {'✓' if final_counts['painting'] >= 200 else '⚠️'}")
    print(f"  Sculptures: {final_counts['sculpture']}/64 {'✓' if final_counts['sculpture'] >= 64 else '⚠️'}")
    print(f"  Architecture: {final_counts['architecture']}/64 {'✓' if final_counts['architecture'] >= 64 else '⚠️'}")
    print("")
    print(f"Output: {OUTPUT_PATH}")
    print("")
    print("Next steps:")
    print("  1. Validate: python scripts/validate_dataset.py --input data/artworks-complete.json")
    print("  2. Enrich with Wikimedia: python scripts/enrich_from_wikimedia.py --input data/artworks-complete.json")
    print("=" * 80)

if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"\n❌ FATAL ERROR: {err}")
        sys.exit(1)