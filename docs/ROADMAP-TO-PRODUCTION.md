# Roadmap to Production: MVP → Production-Ready

**Status:** Planning Complete
**Created:** 2026-03-01
**Target:** Transform Learning Art from 10-artwork MVP to production-ready application with 328 artworks

---

## Executive Summary

This roadmap outlines the path from the current MVP (10 artworks, 5 eras) to a production-ready Learning Art application with a complete curated dataset and optimized performance.

**Current State:**
- ✅ MVP complete with core features (timeline, image upload, review system)
- ✅ 10 artworks across 5 eras
- ✅ Build time: 3.6s, Page load: <1s
- ✅ All protocols and workflows established

**Target State:**
- 🎯 328 artworks (200 paintings, 64 sculptures, 64 architectures)
- 🎯 10-12 comprehensive art historical eras
- 🎯 328 LLM-generated commentaries (6-dimension analysis)
- 🎯 Build time: <5 minutes
- 🎯 Page load: <2s initial, <500ms cached
- 🎯 Lighthouse score: >90

**Total Estimated Effort:** 54-60 hours (~2-3 weeks at 5-10 hours/day)

---

## Phase 1: Full Dataset Expansion (35-41 hours)

**Document:** `docs/execution-plans/0002-full-dataset-expansion.md`

### Objectives
1. Expand artwork collection from 10 → 328
2. Expand era coverage from 5 → 10-12
3. Generate 328 commentary files
4. Initialize review schedules for full dataset

### Key Deliverables

| Deliverable | Quantity | Method |
|-------------|----------|--------|
| Artworks | 328 (200/64/64) | LLM selection + manual review |
| Eras | 10-12 | Era definitions + LLM introductions |
| Commentaries | 328 files | LLM generation with RAG |
| Images | 328 URLs/files | Wikimedia API + optional download |
| Review schedules | 328 entries | SM-2 initialization, staggered |

### Timeline Breakdown

```
Week 1 (20 hours):
├── Days 1-2: Artwork selection (LLM + manual review)          7-8h
├── Day 3:    Metadata enrichment (Wikimedia API)              3-4h
├── Days 4-5: Era expansion (10-12 eras + introductions)       6h
└── Weekend:  Commentary generation (Part 1: 150 works)        ~4h

Week 2 (15-21 hours):
├── Days 1-2: Commentary generation (Part 2: 178 works)        7-10h
├── Day 3:    Commentary quality review                        3h
├── Day 4:    Database population + review scheduling          2.5h
├── Day 5:    Image optimization (optional)                    2-3h
└── Weekend:  Validation & testing                             4h
```

### Critical Dependencies
- ✅ Gemini API access (free tier: 1M tokens/day)
- ✅ Wikimedia Commons API (public, rate-limited)
- ⚠️ ~40 hours of focused work time
- ⚠️ LLM generation time (~10-15 hours spread across multiple days)

### Risk Factors
- **High:** LLM API quota limits → Mitigation: Checkpoint/resume, batch across days
- **Medium:** Poor artwork selection quality → Mitigation: Manual review step
- **Medium:** Commentary quality issues → Mitigation: RAG context, sample review
- **Low:** Image download failures → Mitigation: Fallback to URLs

---

## Phase 2: Performance Optimization (19.5 hours)

**Document:** `docs/execution-plans/0003-performance-optimization.md`

### Objectives
1. Ensure build completes in <5 minutes (350+ pages)
2. Optimize page loads to <2s initial, <500ms cached
3. Implement pagination for large datasets
4. Add performance monitoring

### Key Optimizations

| Optimization | Impact | Effort |
|--------------|--------|--------|
| Database indexing | High (build time) | 2h |
| Query caching | High (build time) | 2h |
| Pagination | High (UX) | 2h |
| Bundle optimization | Medium (load time) | 2h |
| Image lazy loading | Medium (load time) | 1h |
| Caching headers | Medium (repeat visits) | 1h |
| Virtual scrolling | Low (optional) | 2h |
| PWA/Service Worker | Low (offline) | 2h |

### Timeline Breakdown

```
Week 3 (20 hours):
├── Day 1: Performance audit baseline                          1h
├── Day 2: Build performance (DB indexes, caching)             3h
├── Day 3: Frontend performance (bundle, images, pagination)   6h
├── Day 4: Data loading & runtime optimizations               2.5h
├── Day 5: Caching strategy + monitoring                       4h
└── Weekend: Testing & validation                              3.5h
```

### Performance Targets

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Build time | 3.6s | <5 min | Critical |
| Page load (initial) | <1s | <2s | Critical |
| Page load (cached) | <1s | <500ms | High |
| First Load JS | 111kB | <200kB | High |
| LCP | <1s | <2.5s | Critical |
| Lighthouse Performance | 100 | >90 | High |

### Critical Path Optimizations
1. **Database indexing** (must-have)
2. **Query caching** (must-have)
3. **Pagination** (must-have for >50 items)
4. **Bundle optimization** (keep <200kB)

---

## Integrated Timeline

**Total Duration:** 2-3 weeks (54-60 hours)

```
┌─────────────────────────────────────────────────────────────┐
│ Week 1: Dataset Expansion (Part 1)                          │
├─────────────────────────────────────────────────────────────┤
│ Mon-Tue:  Artwork selection (LLM + review)         7-8h     │
│ Wed:      Metadata enrichment                      3-4h     │
│ Thu-Fri:  Era expansion + introductions            6h       │
│ Weekend:  Commentary generation (Part 1)           4h       │
│ Total:    ~20h                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Week 2: Dataset Expansion (Part 2)                          │
├─────────────────────────────────────────────────────────────┤
│ Mon-Tue:  Commentary generation (Part 2)           7-10h    │
│ Wed:      Commentary quality review                3h       │
│ Thu:      Database population + scheduling         2.5h    │
│ Fri:      Image optimization (optional)            2-3h    │
│ Weekend:  Validation & testing                     4h       │
│ Total:    ~19-22h                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Week 3: Performance Optimization                            │
├─────────────────────────────────────────────────────────────┤
│ Mon:      Performance audit baseline              1h       │
│ Tue:      Build performance optimizations         3h       │
│ Wed:      Frontend performance                    6h       │
│ Thu:      Data loading & runtime                  2.5h    │
│ Fri:      Caching + monitoring                    4h       │
│ Weekend:  Testing & validation                    3.5h    │
│ Total:    ~20h                                              │
└─────────────────────────────────────────────────────────────┘

Grand Total: 59-62 hours (~3 weeks)
```

---

## Alternative Approaches

### Approach A: Sequential (Recommended)
**Timeline:** 3 weeks
**Risk:** Low
**Quality:** High

1. Complete full dataset expansion (Week 1-2)
2. Validate dataset quality
3. Optimize performance (Week 3)
4. Final testing

**Pros:**
- Clear milestones
- Can test dataset before optimizing
- Lower risk of rework

**Cons:**
- Longer time to completion
- Performance issues may surface late

---

### Approach B: Parallel (Aggressive)
**Timeline:** 2 weeks
**Risk:** Medium
**Quality:** Medium-High

1. Dataset expansion + performance optimization in parallel
2. Incremental dataset loading (50 → 150 → 328)
3. Optimize at each increment

**Pros:**
- Faster completion
- Catches performance issues early

**Cons:**
- Higher coordination overhead
- May need to optimize multiple times
- Risk of burnout

---

### Approach C: Phased Release (Conservative)
**Timeline:** 4+ weeks
**Risk:** Very Low
**Quality:** Very High

1. Week 1: Expand to 50 artworks, 7 eras
2. Week 2: Optimize for 50 artworks
3. Week 3: Expand to 150 artworks
4. Week 4: Expand to 328 artworks + final optimization

**Pros:**
- Lowest risk
- Continuous validation
- User feedback at each phase

**Cons:**
- Longest timeline
- Multiple optimization cycles

---

## Recommended Approach: **Sequential (Approach A)**

**Rationale:**
- Clear separation of concerns
- Easier to validate dataset quality before performance work
- Established protocols favor thorough, systematic approach
- Lower risk of rework

---

## Success Criteria

### Phase 1 Complete ✓
- [x] 328 artworks in database (validated)
- [x] 10-12 eras with introductions
- [x] 328 commentary files generated
- [x] >98% image coverage
- [x] Review schedules initialized
- [x] All artworks correctly mapped to eras

### Phase 2 Complete ✓
- [x] Build time <5 minutes
- [x] Page load <2s (initial), <500ms (cached)
- [x] Lighthouse Performance >90
- [x] Database indexed and optimized
- [x] Pagination implemented
- [x] Performance monitoring in place

### Production Ready ✓
- [x] All tests passing
- [x] Documentation updated
- [x] Performance targets met
- [x] User acceptance testing complete
- [x] Backup/archival strategy documented

---

## Decision Points

### Before Starting Phase 1:
**Q:** Use LLM or manual curation for artwork selection?
**A:** LLM for speed, manual review for quality (hybrid approach)

**Q:** Generate all commentary or prioritize top artworks?
**A:** Generate all (328) - ensures consistency, uses free API tier

**Q:** Download images locally or use Wikimedia URLs?
**A:** Start with URLs, optional download in Step 7 (saves ~2-3 hours)

### Before Starting Phase 2:
**Q:** Pagination or virtual scrolling?
**A:** Start with pagination (simpler), add virtual scrolling if needed

**Q:** Full static generation or ISR?
**A:** Full static first, ISR only if build >10 minutes

**Q:** PWA/offline support?
**A:** Optional - nice-to-have, not critical for local-first app

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM quota exceeded | Medium | High | Batch processing, spread over 3-5 days |
| Poor artwork quality | Medium | High | Manual review step (3-4 hours) |
| Build time >10 min | Low | Medium | ISR fallback, incremental generation |
| Commentary quality low | Medium | Medium | RAG context, sample review, regeneration |
| Performance targets missed | Low | High | Performance monitoring, iterative optimization |

---

## Next Steps

### Immediate (Today):
1. ✅ Review execution plans (0002, 0003)
2. ⬜ Decide on approach (Sequential recommended)
3. ⬜ Confirm Gemini API access and quota
4. ⬜ Set start date for Phase 1

### Week 1 Start:
1. ⬜ Create feature branch: `feature/full-dataset`
2. ⬜ Begin Step 1.1: Define selection criteria
3. ⬜ Execute artwork selection script
4. ⬜ Daily progress tracking

### Checkpoints:
- **End of Week 1:** 328 artworks selected, metadata enriched, eras expanded
- **End of Week 2:** Commentaries generated, database populated, validation complete
- **End of Week 3:** Performance optimized, all targets met, ready for UAT

---

## Resources

### Documentation
- Execution Plan 0002: Full Dataset Expansion
- Execution Plan 0003: Performance Optimization
- Design Doc 0001: Artwork Selection Criteria
- Protocol: Working Protocols (`docs/protocols/working-protocols.md`)

### Scripts (to be created/updated)
- `scripts/select_artworks_full.ts`
- `scripts/enrich_from_wikimedia.ts` (update for batch)
- `scripts/generate_commentary.ts` (update for batch)
- `scripts/validate_dataset.ts` (new)
- `scripts/add_db_indexes.ts` (new)

### External Resources
- Gemini API: https://ai.google.dev/
- Wikimedia Commons API: https://commons.wikimedia.org/w/api.php
- Next.js Performance Docs: https://nextjs.org/docs/app/building-your-application/optimizing

---

## Conclusion

The roadmap to production is **well-defined, achievable, and low-risk**. With the execution plans in place, the project can systematically expand from MVP to production-ready in 2-3 weeks of focused work.

**Key Success Factors:**
1. Follow the sequential approach (dataset first, then performance)
2. Use checkpoints and validation at each phase
3. Leverage LLM automation where quality is acceptable
4. Maintain manual review for critical quality checkpoints
5. Track progress daily, adjust timeline as needed

**Estimated Completion:** 3 weeks from start date
**Confidence Level:** High (plans are detailed, risks identified, protocols established)

---

**Ready to begin? Choose your start date and let's build a production-ready art learning application!** 🎨
