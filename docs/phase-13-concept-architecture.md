# Phase 13 — Concept Landings: Discovery + Architecture

**Status:** DISCOVERY + ARCHITECTURE COMPLETE  
**Scope:** Analysis only. No application code, content, routing, or search ranking changes.  
**Inputs:** Existing JavaForge curriculum (via built `public/content/*`), search index (2,559 docs), lesson page JSON (`related` / `connected`).  
**Artifacts:** this document · `docs/concepts.json` (deterministic evidence inventory)

---

## 1. Executive summary

JavaForge already contains the **raw materials** for concept landings: ordered lessons, package-linked examples, interview hubs, LeetCode solutions, version features, and projects. What it lacks is a **first-class concept node** that assembles those resources without rewriting them.

Discovery (deterministic title/file/keyword matching + explicit markdown links) produced:

| Metric | Count |
|--------|------:|
| Candidate concepts in inventory | **58** |
| Coverage A (strong) | **15** |
| Coverage B (good) | **8** |
| Coverage C (partial) | **12** |
| Coverage D (weak) | **23** |
| Coverage E (ambiguous) | **0** in this inventory method |

Structural patterns already present among inventory rows:

| Pattern | Count |
|---------|------:|
| Lesson → Code | 19 |
| Lesson → Code → Interview | 13 |
| Lesson → Code → LeetCode | 4 |
| Lesson → Code → Interview → LeetCode | 3 |
| Concept ↔ Project | 5 |
| Version feature ↔ Example | 11 |

**Recommendation:** Concept pages are viable as an **additive navigation layer**. Start with coverage **A/B** only (~23 pages), not the full extractable set. Do not auto-generate thin pages for D-tier tokens.

---

## 2. Concept discovery methodology

### Sources (existing only)

1. **Lesson titles** (`docs/02-learn/*`, excluding indexes) — primary concept seeds.
2. **High-signal type names** appearing as interview/example subjects (`HashMap`, `CompletableFuture`, `Optional`, …) when strong title/file evidence exists.
3. **Search index fields:** `title`, `file`, `keywords`, `topic`, `hint`, `description`, `headings`, `type`, `url`.
4. **Lesson page JSON:** `doc.related` (Java files mentioned in the lesson), `doc.connected` (explicit markdown links to interview / reference / projects), `previous` / `next`, `stageLabel`.

### Matching rules

- Normalize with the same CamelCase / lowercase / punctuation approach used by search.
- **Strong hit:** concept matches `title`, `file`, or a `keywords` entry as whole tokens (with soft plurals: String/Strings).
- **Weak hit:** concept appears only in description/hint/topic/headings blob.
- Flat identifier containment only for tokens length ≥ 6 (e.g. `hashmap` inside titles).

### Normalization / merging

| Observed labels | Treat as | Rationale |
|-----------------|----------|-----------|
| String, Strings | **Strings** (primary = lesson title) | Same lesson `08-Strings.md`; plural soft-match |
| Stream vs Streams & Optional | Keep **Streams & Optional** as lesson concept; **Stream** as API-type concept only if inventory seeds it separately | Lesson is broader (includes Optional) |
| REST APIs / REST API | **REST APIs** (lesson title) | Same chapter |
| JVM & Memory / JVM | **JVM & Memory** for lesson landings; short **JVM** acceptable as alias | Same primary lesson |
| Virtual Threads | Own concept; primary teaching home is Concurrency lesson **section**, not a dedicated lesson file | Heading + examples + version JEPs |

Do **not** merge HashMap into Collections, or Executors into Concurrency, when evidence shows distinct interview/example clusters.

### What was not done

- No LLM topic extraction.
- No merging by “common Java knowledge.”
- No inventing relationships from package proximity alone (package proximity is **B**-class evidence only when paired with naming).

---

## 3. Concept evidence model

```text
CONCEPT
 ├── id / slug / display title / aliases
 ├── origin (lesson-title | type-name-evidence)
 ├── coverage (A–E)
 ├── lessons[]      (search docs + page URLs)
 ├── examples[]     (pkg paths, linkedLesson when present)
 ├── references[]
 ├── interviews[]   (page hubs + #question anchors)
 ├── leetcode[]
 ├── projects[]
 ├── versions[]     (release + JEP feature docs)
 ├── explicitLinks  (from lesson connected/related)
 └── learningPosition (stageLabel, prev/next when a primary lesson exists)
```

Machine-readable snapshot: `docs/concepts.json`.

---

## 4. Coverage classification

| Class | Meaning | Inventory |
|-------|---------|----------:|
| **A** | Strong — multiple resource types with strong hits | 15 |
| **B** | Good — several useful strong resources | 8 |
| **C** | Partial — concept real but thin across types | 12 |
| **D** | Weak — incidental | 23 |
| **E** | Ambiguous | 0* |

\*Method only kept seeds with at least minimal evidence; true E cases were never added to inventory.

**A/B examples (strong existing evidence):** Strings, Collections, Exceptions, Generics, Streams/Stream, Concurrency, JVM, Algorithms, Arrays, Data Structures, Design Patterns, LinkedList, Optional, Testing, HashMap, CompletableFuture, Spring Boot, REST API, HttpClient, …

**Implementation gate:** Only **A** and selected **B** concepts should become prerendered concept pages in the first implementation slice.

---

## 5. Relationship model

| Class | Definition | Safe for auto-nav? |
|-------|------------|--------------------|
| **A — Explicit** | Markdown links already parsed into `doc.connected` / `doc.related` | **Yes** |
| **B — Strong deterministic** | Shared primary lesson; same package + naming (`concurrency3ExecutorsDemo` under Concurrency); curriculum `previous`/`next`; version feature ↔ example links already on version pages | **Yes**, with provenance shown |
| **C — Weak/inferred** | Co-occurrence in descriptions; LeetCode title contains type name; same stage only | **No** (display as search suggestions later, not as graph edges) |

### Patterns already observed (explicit + strong)

- **Lesson → Code:** Strings→`core9StringsDemo`; Collections→`core19`/`core28`; Concurrency→`concurrency1…`; REST→`restapi1…`; JVM→`jvm1…`
- **Lesson → Interview:** nearly all Core/Concurrency/Spring lessons via `connected.interview`
- **Lesson → Reference:** JVM→JVM Internals; REST→RestApis reference
- **Lesson → Project:** Spring Boot→Notes API; REST→Todo REST
- **Version → Example:** Virtual Threads JEPs ↔ `concurrency6VirtualThreadsDemo` / `pkg2versions` notes
- **Type concept without dedicated lesson:** HashMap, ArrayList, Executors, CompletableFuture, JPA — interview-heavy; parent lesson is Collections / Concurrency / Spring / JDBC

---

## 6. Proposed concept-page information architecture

Proposed sections (populate only from existing evidence):

| # | Section | Populated from | Needs Phase 14 authoring? |
|---|---------|----------------|---------------------------|
| 1 | Concept title | Canonical display name + aliases | No |
| 2 | Short introduction | Lesson `description` / search summary if primary lesson exists; else omit | Yes if no lesson summary |
| 3 | Learning position | `stageLabel`, prev/next of primary lesson | No |
| 4 | Lessons | Strong lesson hits + primary lesson | No |
| 5 | Code examples | `related` + strong example hits (dedupe by path) | No |
| 6 | Reference | `connected.reference` + strong reference hits | No |
| 7 | Related concepts | Only A/B relationship edges | Yes for curated “see also” beyond graph |
| 8 | Interview | `connected.interview` + top strong interview titles (cap list) | No |
| 9 | LeetCode / practice | Strong leetcode hits (cap; show plan when present) | No |
| 10 | Projects | `connected.projects` + strong project hits | No |
| 11 | Java version relevance | Strong version/JEP hits | No |

**Empty sections:** hide entirely. Never fill with generic Java textbook prose.

---

## 7. Routing proposal

### Recommended additive model

```text
/concepts                     → index of published concepts (A/B)
/concepts/<slug>              → concept landing
```

Existing routes (`/docs/…`, `/examples/…`, `/versions/…`, `/projects`, …) **unchanged**.

### Slug rules

1. Prefer primary lesson slug when concept originates from a lesson title:  
   `Strings` → `strings` (from normalized flat form), or align with lesson file stem `08-Strings` → `strings`.
2. Type-name concepts: `HashMap` → `hashmap`, `CompletableFuture` → `completablefuture`, `Virtual Threads` → `virtual-threads` (multi-word: hyphenate normalized tokens).
3. Collision: if two concepts flatten identically, disambiguate with origin suffix (`collections` vs rare clash → keep lesson winner; document in build error).
4. Aliases (`string` → `strings`) via redirect page or canonical link to primary slug — implement as prerendered alias HTML **only if** needed for search deep-links; otherwise alias table in concept JSON only.

### SEO

- Canonical: `https://<origin>/concepts/<slug>`
- Indexable when coverage A/B and at least two resource types
- Sitemap: include concept index + A/B landings
- Breadcrumbs: `JavaForge / Concepts / <Title>`

### Prerender

- Additive pages only; estimate **+1 index + ~23 landings** for first slice (~+24 HTML files)

---

## 8. Search integration proposal (design only)

### Model

Add search documents with `type: 'concept'` (new enum value):

```text
Query: HashMap
1. CONCEPT — HashMap
2. CODE / LESSON / …
```

### Fit with Phase 12

- Ranking already supports type boosts; add `concept` with a boost **between lesson and example** (e.g. slightly above lesson) **only when** title exact/phrase matches.
- Result IA already has TYPE · title · description · meta — label **CONCEPT**.
- Index growth: +~23 docs in first slice (negligible vs 2,559).
- Bundle: small (`SEARCH_TYPE_LABEL` + boost map entry).
- Do **not** change ranking for existing types in the same PR as concept generation without dedicated tests.

### Risk

Concept results could dominate every query if boost is too high. Gate: require exact/near-exact title match before concept can rank in top 3.

---

## 9. Content ownership boundaries

| Surface | Owns | Must not become |
|---------|------|-----------------|
| **Concept page** | Navigation, context, relationships, “where to go next” | A rewritten lesson or FAQ dump |
| **Lesson** | Teaching narrative, mental models, ordered explanation | A link farm |
| **Code example** | Runnable source + header EXPLANATION | Concept essay |
| **Reference** | Factual/API-oriented lookup | Interview drill |
| **Interview** | Q&A preparation | Full tutorial |
| **LeetCode** | Problem/solution practice from source headers | Invented problem statements |
| **Project** | Multi-file lab | Concept glossary |
| **Version page** | Release/JEP timeline | General concurrency textbook |

Concept pages **compose links**; they do not fork markdown.

---

## 10. Detailed analysis — 15 requested concepts

Evidence from `docs/concepts.json` focus section + lesson page metadata.  
Where JavaForge lacks a dedicated artifact: **Not established by current repository evidence.**

### String

- **Coverage:** A  
- **Lessons:** Strings (`/docs/02-learn--08-Strings`), stage Foundation; prev Arrays; next User Input  
- **Examples:** `pkg1core/core9StringsDemo.java` (explicit related); also performance concat benchmark (strong title)  
- **References:** Not established as a dedicated Strings reference page (interview hub linked instead)  
- **Interviews:** Explicit → Strings & Performance; many strong question anchors  
- **LeetCode:** Many titles containing String (practice adjacency; treat as C-class relatedness unless category metadata says String)  
- **Projects:** Not established  
- **Java versions:** String-related JEPs/features (templates, switch, etc.)  
- **Explicit relationships:** lesson → example; lesson → interview  
- **Strong deterministic:** String ↔ Strings alias; StringBuilder questions under same interview hub  
- **Landing sections ready:** intro (lesson summary), position, lesson, code, interview, versions  
- **Needs authoring:** curated related concepts (StringBuilder/StringBuffer) beyond explicit links; LeetCode filtering

### Collections

- **Coverage:** A  
- **Lessons:** Collections; stage Core Java  
- **Examples:** `core19CollectionsDemo`, `core28ComparatorDemo` (explicit)  
- **References:** Not established as dedicated Collections reference  
- **Interviews:** Explicit → Collections Framework (120+)  
- **LeetCode:** Not established as Collections-tagged set in index  
- **Projects:** Not established  
- **Versions:** Sequenced collections / factory methods features  
- **Explicit:** lesson → examples + interview  
- **Strong deterministic:** HashMap/ArrayList/etc. as child type concepts  
- **Landing ready:** lesson, code, interview, versions, related type concepts (B)  
- **Needs authoring:** short “map of the framework” only if lesson summary insufficient

### HashMap

- **Coverage:** B  
- **Lessons:** No dedicated lesson — parent **Collections** (weak title match only)  
- **Examples:** No HashMap-named demo file — hash table DS example is related by topic, not explicit  
- **References:** Not established  
- **Interviews:** Strong cluster (“How does HashMap work internally?”, vs TreeMap/ConcurrentHashMap, …)  
- **LeetCode:** Some solutions using maps (title/keyword adjacency)  
- **Projects / versions:** Not established for HashMap-as-concept  
- **Explicit relationships:** Not established on a HashMap primary lesson  
- **Strong deterministic:** under Collections interview hub; vs ConcurrentHashMap/LinkedHashMap/TreeMap questions  
- **Landing ready:** interview-first; link up to Collections lesson; related map types (B from interview titles)  
- **Needs authoring:** concept intro; explicit example pointer if desired (would be Phase 14 or JavaForge link edit)

### ArrayList

- **Coverage:** C  
- **Lessons:** No dedicated lesson — lives under Collections  
- **Examples:** Not established as ArrayList-named demo  
- **References:** Not established  
- **Interviews:** Strong Q&A cluster vs LinkedList, capacity, CopyOnWriteArrayList  
- **LeetCode / projects / versions:** Not established  
- **Explicit:** Not established  
- **Strong deterministic:** Collections parent; LinkedList contrast questions  
- **Landing ready:** interview-centric stub + parent Collections  
- **Needs authoring:** intro; whether to publish at all in slice 1 (borderline — maybe wait)

### Exceptions

- **Coverage:** A  
- **Lessons:** Exceptions; related `core18ExceptionsDemo`  
- **Interviews:** Explicit Exceptions hub  
- **Examples / versions:** Strong example; Helpful NPE version notes  
- **LeetCode / projects:** Not established  
- **Landing ready:** full lesson→code→interview spine  
- **Needs authoring:** minimal

### Generics

- **Coverage:** A  
- **Lessons:** Generics; example `core20GenericsDemo`; interview hub explicit  
- **Versions:** Generics feature entries exist in version corpus  
- **LeetCode / projects:** Not established  
- **Landing ready:** lesson→code→interview→versions  
- **Needs authoring:** minimal

### Streams

- **Coverage:** A (with caveat)  
- **Lessons:** Streams & Optional; examples `core22`/`core23`; interview Streams hub  
- **Caveat:** Discovery also strong-matched **I/O** byte/character stream demos — those are **not** java.util.stream. Filter by package/`pkg1core` + lesson related list for landings.  
- **Versions:** Stream API / Gatherers / `toList` features  
- **LeetCode:** incidental title hit (“Data Stream”) — weak  
- **Landing ready:** lesson→code→interview→versions if I/O false positives excluded  
- **Needs authoring:** clarify Optional pairing on the landing (link only)

### Concurrency

- **Coverage:** A  
- **Lessons:** Concurrency; related starts at `concurrency1ThreadBasics`; full `pkg7` + `pkg16` examples strong-named  
- **Reference:** Java Memory Model reference (pkg16)  
- **Interviews:** Explicit Concurrency hub  
- **Versions:** Structured concurrency / virtual threads family  
- **Projects / LeetCode:** Not established  
- **Landing ready:** richest spine in the curriculum  
- **Related concepts (B):** Executors, CompletableFuture, Virtual Threads as child landings

### Executors

- **Coverage:** B  
- **Lessons:** Not established (section inside Concurrency)  
- **Examples:** `concurrency3ExecutorsDemo`  
- **Interviews:** ExecutorService / pool questions  
- **Landing ready:** example + interview + parent Concurrency  
- **Needs authoring:** one-line positioning sentence if no lesson summary

### CompletableFuture

- **Coverage:** B  
- **Examples:** `concurrency4CompletableFutureDemo`  
- **Interviews:** dedicated CF questions  
- **Versions:** CompletableFuture feature entries  
- **Lessons:** Not established as standalone  
- **Landing ready:** code→interview→version + parent Concurrency  
- **Needs authoring:** intro if required

### Virtual Threads

- **Coverage:** A  
- **Lessons:** No standalone file; taught inside Concurrency (heading) + version pages  
- **Examples:** `concurrency6VirtualThreadsDemo`  
- **Interviews:** strong VT questions  
- **Versions:** JEP 444 / previews / pinning-related features  
- **Explicit on Concurrency lesson:** interview hub (not VT-specific link)  
- **Landing ready:** version + example + interview; parent Concurrency  
- **Needs authoring:** optional intro; do not duplicate JEP summaries

### JVM

- **Coverage:** A  
- **Lessons:** JVM & Memory; example `jvm1…`; explicit interview + **JVM Internals** reference  
- **Versions:** many GC/runtime features (noisy — cap on landing)  
- **Landing ready:** lesson→code→reference→interview→selected versions  
- **Needs authoring:** curation rules for which JEPs appear

### Spring Boot

- **Coverage:** B  
- **Lessons:** Spring Boot Intro  
- **Examples:** code lives under `pkg21spring` / project tree — **not** indexed as `example` type the same way as `pkg*` single-file demos (Not established as search `example` hits in focus counts)  
- **Interviews:** explicit Spring Boot hub  
- **Projects:** Notes API explicit  
- **Landing ready:** lesson→interview→project; link into package/project paths via existing project metadata  
- **Needs authoring:** none for navigation; ensure build exposes spring file links if desired later

### REST API

- **Coverage:** B  
- **Lessons:** REST APIs; five `restapi*` examples; reference RestApis; project Todo REST  
- **Interviews:** connected link points at **Spring Boot** interview (backend adjacency), not a dedicated REST interview doc — keep as explicit but label accurately  
- **Landing ready:** lesson→code→reference→project  
- **Needs authoring:** optional REST-vs-Spring disambiguation line

### JPA

- **Coverage:** C  
- **Lessons:** Not established (JDBC lesson exists separately; JPA appears in interview/Spring Data)  
- **Examples:** Not established as JPA-named demos in search example type  
- **Interviews:** JDBC/JPA/Hibernate hub + Spring Data JPA questions  
- **Projects:** Notes API (JPA entity usage) — project-level evidence  
- **Landing ready:** interview + project only — **defer** until Phase 14 or stronger lesson linkage  
- **Needs authoring:** almost all intro/teaching; do not ship thin SEO page

---

## 11. Performance / scaling analysis

| Asset | Current | First slice (A/B ≈ 23) | If all 58 published |
|-------|--------:|------------------------:|--------------------:|
| Prerendered HTML | 570 | ~594 | ~629 |
| Sitemap URLs | 569 | ~593 | ~628 |
| Search docs | 2,559 | ~2,582 | ~2,617 |
| Client JS | ~299 KB | +negligible label/boost | still small |
| Build time | current baseline | +small (tens of pages) | still fine |
| Risk | — | Low | Thin-page / SEO spam risk |

**Policy:** Prefer fewer dense landings over hundreds of token pages.

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Thin concept pages | Ship A/B only; hide empty sections |
| Duplicate lesson content | Compose links only; no markdown fork |
| False-positive matching (Streams↔I/O) | Prefer `related` + package allowlists |
| Search domination by CONCEPT | Exact-title gate for top ranks |
| Relationship hallucination | Explicit + strong deterministic only |
| Spring/JPA under-indexed examples | Use project + interview; don’t invent examples |
| Scope creep into Phase 14 writing | Architecture forbids authored prose now |

---

## 13. Proposed implementation phases

| Phase | Work | Outcome |
|-------|------|---------|
| **13A — Concept data model** | Build-time `concepts.json` generation from lesson titles + allowlisted type seeds + explicit links; coverage filter | Deterministic graph artifact in `public/content` |
| **13B — Routes + prerender** | `/concepts`, `/concepts/<slug>`; sitemap; canonicals; breadcrumbs | Additive HTML only |
| **13C — Landing UI** | Sectioned page using existing PageData patterns; no new CSS system | Readable concept hub |
| **13D — Search integration** | `type: 'concept'` docs + boost + tests | CONCEPT row in Phase 12 UI |
| **13E — Browser QA** | Desktop/mobile, empty sections, aliases, keyboard search | Release bar |

Optional later: **13F** expand from B→selected C (ArrayList, JPA) only after evidence improves.

**Do not start Phase 14** (authored enrichment) until 13A–13E prove navigation value.

---

## 14. Files that would likely need modification (future implementation)

**JavaForge-UI only**

- `scripts/build-content.mjs` (or new `scripts/build-concepts.mjs` invoked from build)
- `src/types.ts`, `src/App.tsx` (route + renderer)
- `src/search.ts`, `src/components/SearchDialog.tsx`, `scripts/check-search.ts`
- `scripts/prerender.mjs` / page JSON emitters
- `scripts/check-output.mjs`, `scripts/check-quality.mjs`
- `README.md` (route docs)

---

## 15. Files / repositories that MUST remain untouched

- **JavaForge/** content (unless a future phase explicitly adds links)
- **JavaMastery/**, **JavaMastery-UI/**
- Cloudflare / deployment configuration
- Phase 12 ranking weights (except additive `concept` type in 13D)
- Existing public URLs for lessons/examples/interview/versions/projects

---

## Appendix — Inventory coverage list (A/B)

From `docs/concepts.json`:

**A:** Algorithms, Arrays, Collections, Concurrency, Data Structures, Design Patterns, Exceptions, Generics, LinkedList, Loops, Methods, Optional, Stream, Strings, Testing  

**B:** CompletableFuture, HashMap, HttpClient, Metaprogramming, Modules & SPI, Resilience Patterns, Semaphore, Standard Libraries, … (see JSON for full B set including Spring/REST depending on seed list)

Focus-requested concepts classified in §10.

---

## Source of truth (Phase 13A)

| Artifact | Role |
|----------|------|
| `docs/concepts.json` | Discovery inventory — coverage, titles, slugs, origins, focus samples |
| `scripts/build-concepts.mjs` | Resolves A/B slice against the live search index + lesson page links |
| `public/content/concepts.json` | Generated build model (refs only; no prose dumps) |
| `src/concepts.ts` / `src/validate-concepts.ts` | Typed schema + validators |

There is a single discovery source (`docs/concepts.json`). The build artifact is derived, never hand-edited. No `/concepts` routes or search `concept` type yet (13B–13D).
