# Phase 14A — HashMap Learning Path (Plan Only)

**Status:** ANALYSIS + IMPLEMENTATION PLAN — complete  
**Parent:** [`phase-14-content-depth-audit.md`](phase-14-content-depth-audit.md)  
**Scope:** HashMap only. No content written. No JavaForge / interview / example file modifications in this phase.  
**Rule:** Evidence from the repository only. Gaps stated as “not established by current repository content” where appropriate.

---

## 1. Executive finding

HashMap is **discoverable** (concept page + search) and **interview-deep**, with **fragments** of teaching and code elsewhere. It is **not** yet a continuous learning path.

| Step | Current state |
|------|----------------|
| DISCOVER | EXISTS — `/concepts/hashmap`, search type `concept` |
| UNDERSTAND | PARTIAL — Collections row + quick snippet; no HashMap teaching section |
| SEE CODE | PARTIAL — API usage inside Collections demo; internals via custom hashtable; no dedicated `java.util.HashMap` demo |
| PRACTICE | PARTIAL — many LeetCode files use `HashMap` with APPROACH notes; concept inventory lists only 4 |
| INTERVIEW | EXISTS — strong Collections interview Q&A |
| APPLY | MISSING / NOT ESTABLISHED — no project framed around HashMap |

**Minimal recommended addition:** extend the existing Collections lesson + cross-links + (optional but recommended) one focused `pkg1core` demo — **not** a new standalone chapter, and **not** rewriting interviews.

---

## 2. Inventory of existing HashMap material

### 2.1 Lessons (`docs/02-learn`)

| Resource | What the file establishes | Role(s) |
|----------|---------------------------|---------|
| [`17-Collections.md`](../../JavaForge/docs/02-learn/17-Collections.md) | Picker row “Key-value lookup → HashMap”; frequency `HashMap` + `merge` snippet; ConcurrentHashMap named under thread safety; deep-dive link to Collections interview | DISCOVER (weak), UNDERSTAND (weak), CODE (snippet), INTERVIEW (bridge link) |
| [`08-Strings.md`](../../JavaForge/docs/02-learn/08-Strings.md) | Immutability rationale mentions “safe as HashMap keys” | UNDERSTAND (adjacent only) |
| [`22-DataStructures.md`](../../JavaForge/docs/02-learn/22-DataStructures.md) | Learning-order row “Hash Table → `datastructures6HashTableImpl`”; “Need key lookup? → Hash table / HashMap”; suggests LRU via `LinkedHashMap` | DISCOVER, UNDERSTAND (structure catalog), CODE (points to impl), PRACTICE (LRU exercise prompt) |
| [`23-Algorithms.md`](../../JavaForge/docs/02-learn/23-Algorithms.md) | Big-O table cites “HashMap get” as O(1) | UNDERSTAND (complexity cue) |
| [`24-LeetCode.md`](../../JavaForge/docs/02-learn/24-LeetCode.md) | Study order starts with Two Sum (hash-map approach in code) | PRACTICE (path), DISCOVER |
| [`37-InterviewPrep.md`](../../JavaForge/docs/02-learn/37-InterviewPrep.md) | Checklist: “Implement HashMap logic on a whiteboard” | INTERVIEW (prep cue) |

**Not established:** a dedicated HashMap chapter or a `## HashMap` teaching section with learner-facing internals/API tour.

### 2.2 Java examples

| Resource | Evidence | Role(s) |
|----------|----------|---------|
| [`pkg1core/core19CollectionsDemo.java`](../../JavaForge/pkg1core/core19CollectionsDemo.java) | Header lists HashMap among maps; uses `HashMap` + `merge` / `getOrDefault` / `computeIfAbsent` | CODE, UNDERSTAND (light) |
| [`pkg3datastructures/datastructures6HashTableImpl.java`](../../JavaForge/pkg3datastructures/datastructures6HashTableImpl.java) | Header: “Demonstrates how HashMap works under the hood”; separate chaining, load factor, bit-spread like HashMap; `MyHashMap` | CODE, UNDERSTAND (internals via reimplementation) |
| Other demos using HashMap as a tool | e.g. graphs/tries/patterns/flyweight — **use** HashMap, do not **teach** it | CODE (incidental) — not teaching resources |
| Version demos | `versions2Java7Features` diamond `HashMap`; `versions6Java21Features` `LinkedHashMap` | CODE (version feature) — not HashMap teaching |

**Not established:** a focused `*HashMap*Demo` that teaches `java.util.HashMap` API + key contract (`equals`/`hashCode`) as its primary subject. `core16RecordsDemo` shows record `hashCode` equality but not as map keys.

### 2.3 Reference / quick-ref

| Resource | Evidence | Role(s) |
|----------|----------|---------|
| [`05-quick-ref/01-Cheatsheet.md`](../../JavaForge/docs/05-quick-ref/01-Cheatsheet.md) | `HashMap` one-liner API; complexity row | DISCOVER, UNDERSTAND (cheat) |
| [`05-quick-ref/02-JavaNotes.md`](../../JavaForge/docs/05-quick-ref/02-JavaNotes.md) | Treeify note (Java 8+); equals/hashCode section; ConcurrentHashMap guidance | UNDERSTAND (notes), INTERVIEW-adjacent |

No dedicated `04-reference` HashMap page found.

### 2.4 Interview

| Resource | Evidence | Role(s) |
|----------|----------|---------|
| [`03-interview/03-Collections.md`](../../JavaForge/docs/03-interview/03-Collections.md) Q3 | Internals: buckets, hash spread, chaining, treeify, load factor | INTERVIEW, UNDERSTAND (but Q&A format) |
| Same file Q4, Q6, Q9, Q10 | vs Hashtable/CHM; vs Tree/Linked; load factor; immutable keys / stable hashCode | INTERVIEW |
| Rapid-fire lines | null keys, treeify thresholds, sizing, thread-safe alt, frequency idiom | INTERVIEW |
| Other hubs | WeakHashMap (JVM/EffectiveJava), ConcurrentHashMap (Concurrency), LinkedHashMap (Java9–21), serialization, performance sizing | INTERVIEW (adjacent maps) |

**Not established:** interview content that *requires* a prior HashMap lesson — the Q&A currently **is** the primary explanation of internals.

### 2.5 Practice (LeetCode) — repository APPROACH evidence

Concept model currently lists only four Official-75 problems. Broader repository evidence (APPROACH / comments mentioning hash map / `HashMap`) includes at least:

| File | APPROACH / comment evidence |
|------|----------------------------|
| `pkg5leetcode/blind75/blind75_LC1TwoSum.java` | “One-pass hash map…” |
| `pkg5leetcode/leetcode1TwoSum.java` | “one-pass hash map…” |
| `pkg5leetcode/blind75/blind75_LC49GroupAnagrams.java` | “HashMap keyed by sorted char signature” |
| `pkg5leetcode/interview150/interview150_LC560SubarraySumEqualsK.java` | “Prefix sum hash map…” |
| `pkg5leetcode/interview150/interview150_LC205IsomorphicStrings.java` | “Two hash maps…” |
| `pkg5leetcode/interview150/interview150_LC146LRUCache.java` | “HashMap + doubly linked list…” |
| `pkg5leetcode/blind75/blind75_LC133CloneGraph.java` | “HashMap old→clone” |
| `pkg5leetcode/official75/official75_LC437PathSumIII.java` | “Prefix sum … with hash map” |
| Plus concept-listed Official 75: LC1207, LC1657, LC2215, LC2352 | Use `HashMap` in solutions |

**Do not treat** every file that imports `HashMap` as HashMap practice without APPROACH/teaching intent. Incidental uses (e.g. graph adjacency) are **APPLY-as-tool**, not HashMap practice.

### 2.6 Projects

| Finding | Verdict |
|---------|---------|
| No project README/lesson frames HashMap as a learning goal | APPLY **MISSING** / **NOT ESTABLISHED** |

### 2.7 Concept page / UI

| Resource | Evidence | Role(s) |
|----------|----------|---------|
| `/concepts/hashmap` | Coverage B; **0 lessons, 0 examples**; interviews + 4 LeetCode; fit = “Collections Framework” (label only) | DISCOVER |
| Search `concept:hashmap` | Exact title ranks first for “HashMap” | DISCOVER |

### 2.8 Cross-links today

| From | To HashMap teaching | Established? |
|------|---------------------|--------------|
| Collections lesson | Interview hub (whole file) | Yes |
| Collections lesson | `datastructures6HashTableImpl` | **No** |
| Collections lesson | Named interview anchors (Q3 internals) | **No** (file-level only) |
| Collections lesson | Two Sum / hash-map LeetCode | **No** |
| Concept page | Lesson / demo | **No** (empty groups) |
| DS lesson | Hashtable impl | Yes (catalog) |
| Strings lesson | HashMap keys mention | One sentence |

---

## 3. Classification by learner step

| Resource | Discover | Understand | Code | Practice | Interview | Apply |
|----------|:--------:|:----------:|:----:|:--------:|:---------:|:-----:|
| `/concepts/hashmap` | ● | | | | ● (links) | |
| `17-Collections.md` | ○ | ○ | ○ | | ○ | |
| `22-DataStructures.md` | ○ | ○ | ○ | ○ (LRU prompt) | | |
| `core19CollectionsDemo` | | ○ | ● | | | |
| `datastructures6HashTableImpl` | | ● | ● | | | |
| Cheatsheet / JavaNotes | ○ | ○ | | | | |
| Collections interview Q3–Q10+ | | ●* | | | ● | |
| Two Sum / Group Anagrams / … | | | ● | ● | | |
| Projects | | | | | | — |

\*Interview UNDERSTAND is Q&A depth, not a progressive lesson.

---

## 4. Learning gap (concrete)

```
/concepts/hashmap  ──DISCOVER──►  interview Q&A (internals, variants)
        │                              ▲
        │                              │ assumes hashing / equals / load factor
        ▼                              │
 Collections “HashMap” row + snippet ──┘  (too thin to prepare)
        │
        ├── core19CollectionsDemo (API usage only; no key contract)
        │
        └── datastructures6HashTableImpl (internals, but not linked from Collections
            or concept page; custom MyHashMap ≠ API tour)
```

**Gap statements (repository-backed):**

1. **No introductory HashMap teaching block** — not established beyond a Collections picker row and a short frequency example.  
2. **Interview material assumes internal implementation knowledge** — Q3 explains buckets/treeify/load factor in short/detailed answers; there is no preceding lesson that teaches those ideas in curriculum order.  
3. **Code exists without a HashMap-first explanation path** — Collections demo uses HashMap; hashtable impl explains under the hood; neither is wired as the concept page’s CODE group (concept model: `examples: []`).  
4. **No connection from Collections lesson → hashtable impl → interview anchors** — Collections only links the interview *file*, not Q3 or the DS demo.  
5. **Practice bridge incomplete on the concept page** — repository has explicit hash-map APPROACH problems (e.g. Two Sum) that are **not** in the concept’s LeetCode list (matching/inventory gap).  
6. **Key contract (`equals`/`hashCode`) for map keys** — established in interview Q10 and quick-ref notes; **not** established as a taught, runnable Core demo focused on HashMap.  
7. **Apply** — not established for HashMap as a project goal.

---

## 5. Proposed learning path (target)

```
DISCOVER     /concepts/hashmap (+ search)
     ↓
UNDERSTAND   Collections lesson — new HashMap section (minimal)
     ↓
SEE CODE     (a) core19CollectionsDemo API usage
             (b) optional new core29HashMapDemo — key contract / mistakes
             (c) datastructures6HashTableImpl — under the hood
     ↓
PRACTICE     Explicit links: Two Sum, Group Anagrams, Subarray Sum Equals K
             (APPROACH evidence already in repo)
     ↓
INTERVIEW    Existing Q3, Q4, Q6, Q9, Q10 (+ rapid-fire) — unchanged text
```

---

## 6. Minimal content addition (decision)

| Option | Use? | Rationale |
|--------|------|-----------|
| A. New lesson chapter | **No** (default) | HashMap already sits under Collections; a new chapter would duplicate picker/context |
| B. Extension of existing lesson | **Yes — primary** | Smallest UNDERSTAND fix; matches curriculum placement (`17-Collections.md`) |
| C. New focused example | **Yes — recommended** | Unlocks concept CODE inventory (name/title match) + teaches key contract missing from `core19` |
| D. Cross-links | **Yes — required** | Wire Collections ↔ hashtable ↔ interview anchors ↔ practice |
| E. Practice connections | **Yes — required** | Point to APPROACH-evidenced LeetCode; refresh concept inventory |
| F. Interview connections | **Yes — links only** | Do not rewrite Q&A |

**Not chosen:** rewriting interview content; renaming existing demos; new project.

---

## 7. Proposed lesson structure (extension of `17-Collections.md`)

Add a focused **`## HashMap`** section **after** “Quick examples” (or after “Pick the right collection”), **before** Comparable/thread-safety. Keep Collections voice: short, table/snippet heavy.

| Section | Include? | Basis in existing curriculum |
|---------|----------|------------------------------|
| 1. What is HashMap? | **Yes** | Map row already exists; needs 2–4 sentences |
| 2. When should it be used? | **Yes** | Extends picker table (“key-value lookup”) |
| 3. Key/value model | **Yes** | Matches Collections Map framing |
| 4. Hashing concept (high level) | **Yes (brief)** | Prepares Q3; detail deferred to hashtable demo + interview |
| 5. Lookup/update behavior | **Yes** | Align with `get`/`put`/`merge` already in lesson/demo |
| 6. Collision concept | **Yes (brief)** | Established in interview Q3 + hashtable header — lesson should preview only |
| 7. equals/hashCode relationship | **Yes** | Interview Q10 + JavaNotes; missing from Collections lesson today |
| 8. Performance characteristics | **Yes (brief)** | Algorithms Big-O + interview load factor — average O(1), collision caveat |
| 9. Common mistakes | **Yes** | Mutable keys; `==` vs equals; assuming thread-safety (lesson already warns) |
| 10. Practical example | **Yes** | Keep/extend frequency `merge` snippet; ▶️ link demos |
| 11. Connection to interview | **Yes** | Anchored links to Q3, Q4, Q6, Q9, Q10 — text unchanged |
| 12. Practice | **Yes** | Links to APPROACH-evidenced LeetCode files |

**Omit from this extension:** full treeify/CAS internals essay (belongs in interview + hashtable demo); ConcurrentHashMap deep dive (already concurrency/interview); LRU implementation (DS lesson already prompts it).

**Run line addition (proposed):**  
`▶️ … core19CollectionsDemo` · `core29HashMapDemo` (if added) · `datastructures6HashTableImpl`

---

## 8. Code strategy

### Sufficient today?
- **API tour:** partially — `core19CollectionsDemo` shows HashMap usage among other collections.  
- **Internals:** yes as a *file* — `datastructures6HashTableImpl`, but poorly discovered from HashMap concept/Collections.  
- **Key contract:** **not sufficient** — no Core demo proves broken lookups after mutating a key.

### Smallest additional example (proposed, not written)

| Item | Proposal |
|------|----------|
| Path | `JavaForge/pkg1core/core29HashMapDemo.java` |
| Naming | Next free `coreNN` after `core28ComparatorDemo`; CamelCase `HashMap` in class name for search/concept match |
| Purpose | `java.util.HashMap` put/get/getOrDefault/merge; null key note; equals/hashCode key contract demo; **not** a second full Collections tour |
| Header style | Match existing `EXPLANATION:` / `KEY POINTS:` blocks |
| Do **not** | Rename `core19` or `datastructures6`; duplicate MyHashMap |

If implementation prefers **zero new Java files**, lesson snippets + cross-link to `datastructures6` can cover much of UNDERSTAND/SEE CODE, but concept CODE group and key-contract runnable proof stay weak unless discovery inventory is hand-updated.

---

## 9. Interview bridge (links only)

Connect learning material to **existing** questions in `03-Collections.md` (do not edit answers):

| After learning… | Link to |
|-----------------|---------|
| Hashing + buckets preview | Q3 How does HashMap work internally? |
| Choosing a map | Q4 HashMap vs Hashtable vs ConcurrentHashMap?; Q6 vs TreeMap vs LinkedHashMap? |
| Capacity / load factor | Q9 What is the load factor and capacity? |
| Key contract | Q10 Why must map keys be immutable / have stable hashCode? |
| Rapid drill | Existing rapid-fire: null keys, treeify, sizing, thread-safe alt, frequency idiom |

Secondary (optional links, not primary path): ConcurrentHashMap Q12; WeakHashMap (other hubs); Performance “HashMap sizing?”.

---

## 10. Practice bridge (evidence-based)

**Primary practice set** (APPROACH explicitly hash-map / HashMap):

1. `blind75_LC1TwoSum` / `leetcode1TwoSum` — one-pass hash map  
2. `blind75_LC49GroupAnagrams` — HashMap by signature  
3. `interview150_LC560SubarraySumEqualsK` — prefix sum hash map  
4. Keep concept’s Official-75 four if still valid frequency/map drills  

**Secondary (state as HashMap+structure, optional):** `interview150_LC146LRUCache` (HashMap + list) — also aligns with DS lesson LRU prompt.

**Exclude from HashMap “practice bridge” claims:** problems that only store adjacency in a `HashMap` without APPROACH calling out hashing as the technique (unless later inventory work proves otherwise).

---

## 11. Concept page impact (`/concepts/hashmap`)

**Do not redesign** layout (Phase 13C stands).

After proposed JavaForge + inventory updates, **deterministic links that should become possible**:

| Group | Expected new/updated entries |
|-------|------------------------------|
| Lessons | `17-Collections` **if** matching/inventory lists it (today title “Collections” does **not** strong-match “HashMap” — see risks) |
| Examples | `core29HashMapDemo` (name match); optionally pin `core19CollectionsDemo` + `datastructures6HashTableImpl` via `docs/concepts.json` |
| Interview | Already present |
| LeetCode | Add Two Sum / Group Anagrams / Subarray Sum K via inventory or stronger matching |
| Fit trail | May resolve to Foundation/Core via Collections lesson stage once lesson is linked |
| Related | Optional: related → Collections concept (`/concepts/collections`) if inventory adds deterministic relation |

**UI-only follow-up (MAY):** adjust `docs/concepts.json` HashMap evidence lists so the concept model does not depend solely on title-token matching.

---

## 12. Exact file-change plan (for a future implementation phase)

### MUST CHANGE

| File | Change |
|------|--------|
| `JavaForge/docs/02-learn/17-Collections.md` | Add `## HashMap` section; ▶️ links; interview anchors; practice links; link to hashtable demo |

### MAY CHANGE

| File | Change |
|------|--------|
| `JavaForge/pkg1core/core29HashMapDemo.java` | **New** focused demo (recommended) |
| `JavaForge-UI/docs/concepts.json` | Pin HashMap lessons/examples/leetcode evidence for rebuild |
| `JavaForge/docs/02-learn/22-DataStructures.md` | Optional one-line back-link to Collections HashMap section |
| Concept rebuild outputs | `public/content/concepts.json`, concept page JSON, search concept doc — via existing build, not hand-edit |

### MUST NOT CHANGE

| Target | Reason |
|--------|--------|
| `JavaForge/docs/03-interview/**` | Interview bridge = links only |
| Existing LeetCode solution bodies | Practice = discovery links |
| `datastructures6HashTableImpl.java` behavior/name | Already teaches internals |
| `core19CollectionsDemo.java` rename | Preserve conventions |
| JavaMastery / JavaMastery-UI | Out of scope |
| Cloudflare / search ranking algorithms | Out of scope for 14A content path |
| Other Phase 14 topics (CF, Executors, VT, JPA) | Explicitly deferred |

---

## 13. Risks

1. **Concept inventory matching:** Extending Collections alone may **not** auto-attach the lesson to `/concepts/hashmap` because search title remains “Collections” and `strongDoc` does not use headings. Mitigation: new `core29HashMapDemo` and/or explicit `docs/concepts.json` evidence.  
2. **Scope creep into ConcurrentHashMap / LinkedHashMap:** Keep extension HashMap-first; point variants to existing interview Qs.  
3. **Duplicating interview prose in the lesson:** Keep lesson brief; internals detail stays in Q3 + hashtable demo.  
4. **Practice over-claiming:** Only link problems with repository APPROACH evidence.  
5. **Learner order:** Hashtable impl sits in DS chapter *after* Collections in the path — link it as “optional deeper SEE CODE,” not as a required prior.  
6. **Implementing without the demo:** Faster, but key-contract and concept CODE groups stay weak.

---

## 14. Success criteria (for later implementation — not this phase)

- Learner can go Discover → Understand → See code → Practice → Interview **using linked repository resources**.  
- `/concepts/hashmap` lists ≥1 lesson and ≥1 teaching example (not interview-only).  
- Collections lesson links Q3 and `datastructures6HashTableImpl`.  
- Interview Markdown **unchanged**.  
- No new dependencies; naming follows `coreNN…` / existing docs style.

---

## 15. Out of scope (reminder)

- Writing the lesson text or Java source  
- CompletableFuture / Executors / Virtual Threads / JPA  
- Phase 15  
- Any commit

---

*End of Phase 14A plan.*
