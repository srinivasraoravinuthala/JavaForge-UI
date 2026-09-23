# Phase 14 — Content Depth Audit

**Status:** AUDIT ONLY — complete  
**Scope:** Evidence classification over existing JavaForge curriculum. No content rewrites, no new pages, no application changes.  
**Evidence sources:** JavaForge `docs/`, `pkg*/`, `projects/`; JavaForge-UI concept model (`public/content/concepts.json` / `docs/concepts.json`) used only to locate resources already present in JavaForge.  
**Rule:** If the repository does not establish something, it is marked **NOT ESTABLISHED**.

---

## 1. Executive summary

JavaForge already contains a **dense, usable learning spine** for Core Java topics that have dedicated `02-learn` chapters with paired demos (Strings, Collections, Exceptions, Generics, Streams/Optional, Arrays, Data Structures, Algorithms, Concurrency, JVM). Those chapters are short, syntax-forward, and usually link to interview hubs and runnable files.

The largest **learner-clarity gaps** are not “missing files,” but **uneven depth and fragmented ownership**:

| Pattern observed in the repository | Example |
|------------------------------------|---------|
| Strong lesson + demo + interview | Strings, Exceptions, Generics, Streams/Optional |
| Lesson is a map/index; depth lives in many demos | Data Structures, Algorithms, Concurrency |
| Interview-heavy; no dedicated teaching chapter | HashMap (as a first-class topic), JPA |
| Backend taught via one Spring lab + interview hubs | Spring Boot, JPA (embedded in Spring), REST (reference + `pkg12restapi`) |
| Subtopics exist only inside a parent chapter | Executors, Virtual Threads, CompletableFuture |

Phase 13 concept landings improve **navigation**, not educational depth. A concept page does not substitute for missing lesson or explanation text.

This audit does **not** score concepts, rank them, or declare a “best” concept.

---

## 2. Audit methodology

1. For each concept in the primary set, locate **repository resources** (lesson Markdown, Java demos, reference docs, interview hubs, LeetCode files, projects, version notes).
2. Read the primary lesson (when present) and at least one primary demo header/body for explanation quality.
3. Classify each dimension (A–L) using only what those resources contain.
4. Classify the learner journey (Discover → Interview) the same way.
5. Record gaps as **factual mismatches** between what a learner needs and what the files show—not preferences vs generic tutorials.

A/B concept-slice membership is noted when helpful for navigation, but **absence from the A/B slice is not itself a depth verdict**.

---

## 3. Classification definitions

| Label | Meaning |
|-------|---------|
| **STRONG** | Repository material clearly covers this dimension with usable explanation and/or demonstration. |
| **ADEQUATE** | Enough for a motivated learner following the curriculum; some depth or edge cases left to linked material. |
| **PARTIAL** | Topic is touched (snippet, table, interview Q, or demo) but a learner would still lack solid footing. |
| **MISSING** | Expected dimension has **no** meaningful repository coverage found. |
| **NOT ESTABLISHED** | Cannot confirm from repository content (including ambiguous or contradictory curriculum pointers). |

---

## 4. Compact coverage table

| Concept | Definition | Why | Mental Model | Code | Practice | Interview |
|---------|------------|-----|--------------|------|----------|-----------|
| Strings | STRONG | STRONG | STRONG | STRONG | STRONG | STRONG |
| Collections | STRONG | ADEQUATE | ADEQUATE | STRONG | PARTIAL | STRONG |
| Exceptions | STRONG | ADEQUATE | STRONG | STRONG | MISSING | STRONG |
| Generics | STRONG | STRONG | ADEQUATE | STRONG | MISSING | STRONG |
| Streams | STRONG | ADEQUATE | STRONG | STRONG | PARTIAL | STRONG |
| Optional | STRONG | STRONG | ADEQUATE | STRONG | MISSING | ADEQUATE |
| Concurrency | ADEQUATE | PARTIAL | ADEQUATE | STRONG | MISSING | STRONG |
| CompletableFuture | PARTIAL | PARTIAL | PARTIAL | ADEQUATE | MISSING | ADEQUATE |
| Executors | PARTIAL | PARTIAL | PARTIAL | ADEQUATE | MISSING | PARTIAL |
| Virtual Threads | PARTIAL | ADEQUATE | PARTIAL | ADEQUATE | MISSING | PARTIAL |
| JVM | STRONG | ADEQUATE | ADEQUATE | ADEQUATE | MISSING | STRONG |
| Spring Boot | ADEQUATE | ADEQUATE | PARTIAL | ADEQUATE | PARTIAL | STRONG |
| REST API | STRONG | ADEQUATE | ADEQUATE | STRONG | PARTIAL | PARTIAL |
| JPA | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | STRONG |
| Arrays | STRONG | ADEQUATE | ADEQUATE | STRONG | STRONG | ADEQUATE |
| Data Structures | ADEQUATE | STRONG | ADEQUATE | STRONG | PARTIAL | PARTIAL |
| Algorithms | ADEQUATE | ADEQUATE | ADEQUATE | STRONG | PARTIAL | PARTIAL |
| HashMap | PARTIAL | PARTIAL | PARTIAL | PARTIAL | ADEQUATE | STRONG |

---

## 5. Detailed concept audits

For each concept: dimensions A–L, journey, and concise resource evidence.

### 5.1 Strings

**Evidence:** `docs/02-learn/08-Strings.md`; `pkg1core/core9StringsDemo.java`; `pkg19performance/StringConcatBenchmark.java` (path via curriculum); `docs/03-interview/09-StringsAndPerformance.md` + Core Java string questions; LeetCode string problems under `pkg5leetcode/`; concept `/concepts/strings` (UI navigation only).

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | STRONG | Immutability + pool introduced immediately in lesson |
| B Why | STRONG | Explicit “Why immutable?” callout |
| C Mental model | STRONG | Pool vs `new`, `==` vs `equals` |
| D Syntax/API | STRONG | Methods, StringBuilder, text blocks, formatting |
| E Working code | STRONG | Lesson snippets + `core9StringsDemo` |
| F Code explanation | STRONG | Demo file header EXPLANATION mirrors lesson |
| G Mistakes | STRONG | `==` warning; concat-in-loop cost |
| H Practical usage | ADEQUATE | Formatting/text blocks; limited app-level use |
| I Related | ADEQUATE | Links to interview; concept page links resources |
| J Practice | STRONG | Many LeetCode string entries in index |
| K Interview | STRONG | Dedicated strings/performance interview hub |
| L Progression | ADEQUATE | Lesson → demo → interview; performance demo exists |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice EXISTS · Apply PARTIAL · Interview EXISTS  

**Gaps:** No project that applies string techniques end-to-end. Lesson does not deeply explain StringConcatBenchmark (performance path is separate).

---

### 5.2 Collections

**Evidence:** `docs/02-learn/17-Collections.md`; `pkg1core/core19CollectionsDemo.java`; `pkg1core/core28ComparatorDemo.java`; `docs/03-interview/03-Collections.md`; concept `/concepts/collections`.

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | STRONG | Hierarchy diagram + Map called out separately |
| B Why | ADEQUATE | “Pick the right collection” table |
| C Mental model | ADEQUATE | Selection guidance; little internal structure detail |
| D Syntax/API | STRONG | Quick examples for List/Map/Set/Queue |
| E Working code | STRONG | Core demos |
| F Code explanation | STRONG | Demo header explains List/Set/Map/Queue roles |
| G Mistakes | PARTIAL | Thread-safety note only; few other pitfalls |
| H Practical | ADEQUATE | Frequency `merge` idiom present |
| I Related | ADEQUATE | Interview deep dive linked; HashMap is a subtopic |
| J Practice | PARTIAL | No Collections-tagged LeetCode cluster in concept model (0 LC on A/B concept) |
| K Interview | STRONG | Large Collections interview hub |
| L Progression | ADEQUATE | Lesson → demos → interview |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice PARTIAL · Apply PARTIAL · Interview EXISTS  

**Gaps:** HashMap internals deferred to interview / DS hash-table demo, not taught as a Collections subsection with equal depth. No LeetCode linkage on the Collections concept inventory.

---

### 5.3 Exceptions

**Evidence:** `docs/02-learn/16-Exceptions.md`; `pkg1core/core18ExceptionsDemo.java`; `docs/03-interview/07-Exceptions.md`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–D | STRONG / ADEQUATE | Hierarchy, try/catch/finally, try-with-resources, throw/throws |
| E–F | STRONG | Paired demo |
| G Mistakes | STRONG | Best-practices Do/Don’t table |
| H Practical | ADEQUATE | Custom exception example |
| J Practice | MISSING | No exercise/LeetCode path established for exceptions |
| K Interview | STRONG | Dedicated interview file |
| L Progression | ADEQUATE | Lesson → demo → interview |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview EXISTS  

---

### 5.4 Generics

**Evidence:** `docs/02-learn/18-Generics.md`; `pkg1core/core20GenericsDemo.java`; `docs/03-interview/08-Generics.md`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–B | STRONG | Type safety “why” with compile-error example |
| C Mental model | ADEQUATE | Bounded params + PECS table; erasure depth limited |
| D–F | STRONG | Class/method generics + demo |
| G Mistakes | PARTIAL | PECS guidance; few failure cases shown |
| J Practice | MISSING | Not established |
| K Interview | STRONG | Dedicated hub |
| L Progression | ADEQUATE | Short chapter by design |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview EXISTS  

---

### 5.5 Streams

**Evidence:** Shared lesson `docs/02-learn/20-StreamsAndOptional.md`; `pkg1core/core22StreamsDemo.java`; note: concept inventory also matches `io2ByteStreams` / `io3CharacterStreams` by name (I/O streams—**different concept**); `docs/03-interview/06-Streams.md`; concept `/concepts/stream`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–C | STRONG | Pipeline, lazy intermediate vs terminal, single-use |
| D–F | STRONG | Rich demo (collectors, stats, reduce) |
| G Mistakes | ADEQUATE | Single-use warning; mutation guidance in demo header |
| J Practice | PARTIAL | Concept model lists 1 LeetCode; interview has depth |
| K Interview | STRONG | Streams interview hub |
| L Progression | ADEQUATE | Lesson + demo; optional co-located |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice PARTIAL · Apply PARTIAL · Interview EXISTS  

**Gaps:** Name collision between **API Streams** and **I/O streams** in inventory/search can confuse learners. Lesson does not disambiguate I/O packages.

---

### 5.6 Optional

**Evidence:** Same lesson `20-StreamsAndOptional.md` (Optional section); `pkg1core/core23OptionalDemo.java`; interview questions under Streams/Core hubs; concept `/concepts/optional`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–B | STRONG | “Avoid null returns” + Do/Don’t |
| C–D | ADEQUATE | Core API shown; advanced Optional API limited |
| E–F | STRONG | Dedicated demo |
| J Practice | MISSING | Not established |
| K Interview | ADEQUATE | Present but shared with Streams hub |
| L Progression | PARTIAL | Bundled into Streams chapter (no solo lesson) |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview PARTIAL  

---

### 5.7 Concurrency

**Evidence:** `docs/02-learn/26-Concurrency.md`; `pkg7concurrency/concurrency1`–`8*.java`; `pkg16advconcurrency/*`; `docs/04-reference/11-MemoryModel.md`; `docs/03-interview/04-Concurrency.md`; concept `/concepts/concurrency`.

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | ADEQUATE | Process/thread/race/deadlock table |
| B Why | PARTIAL | Little “when to use concurrency” narrative |
| C Mental model | ADEQUATE | Building blocks shown; JMM mostly via reference/advanced demo |
| D–E | STRONG | Many runnable demos + advanced package |
| F Code explanation | ADEQUATE–STRONG | Demo headers strong; lesson itself is brief |
| G Mistakes | PARTIAL | Pinning note for virtual threads; other pitfalls scattered |
| J Practice | MISSING | No concurrency LeetCode in concept inventory |
| K Interview | STRONG | Large concurrency interview hub |
| L Progression | ADEQUATE | Explicit learning order in lesson |

**Journey:** Discover EXISTS · Understand PARTIAL · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview EXISTS  

**Internal consistency gap (repository evidence):** Lesson “Learning order” numbering/labels do **not** cleanly match `pkg7concurrency` filenames (e.g. lesson step 4 says synchronized/volatile while `concurrency4CompletableFutureDemo.java` is CompletableFuture; Executors live in `concurrency3ExecutorsDemo.java`). A learner following only the numbered list can be misled. Classified **NOT ESTABLISHED** that the published order list is accurate relative to files.

---

### 5.8 CompletableFuture

**Evidence:** Brief snippets in `26-Concurrency.md`; `pkg7concurrency/concurrency4CompletableFutureDemo.java`; interview mentions; concept `/concepts/completablefuture` (B; no lesson).

| Dim | Class | Notes |
|-----|-------|-------|
| A–C | PARTIAL | Introduced as building block; no dedicated chapter |
| D–F | ADEQUATE | Demo header lists key methods; working pipeline |
| G–H | PARTIAL | Error handling shown lightly (`exceptionally` in demo scope) |
| J Practice | MISSING | |
| K Interview | ADEQUATE | Present in concurrency interview material |
| L Progression | PARTIAL | Depends on finding the demo after the concurrency map |

**Journey:** Discover PARTIAL · Understand PARTIAL · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview PARTIAL  

---

### 5.9 Executors

**Evidence:** Snippet in `26-Concurrency.md`; `pkg7concurrency/concurrency3ExecutorsDemo.java`; cheatsheet/quick-ref mentions; **no** A/B concept page.

| Dim | Class | Notes |
|-----|-------|-------|
| A–C | PARTIAL | Covered only as subsection/snippet |
| D–F | ADEQUATE | Demo explains pool types + Future |
| J Practice | MISSING | |
| K Interview | PARTIAL | Embedded in concurrency interviews |
| L Progression | PARTIAL | No dedicated discoverable landing in A/B concepts |

**Journey:** Discover PARTIAL · Understand PARTIAL · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview PARTIAL  

---

### 5.10 Virtual Threads

**Evidence:** Section in `26-Concurrency.md`; `pkg7concurrency/concurrency6VirtualThreadsDemo.java`; version pages/JEP notes (`versions/java-21#jep-444` etc. via UI); interview/version search hits; **no** A/B concept page.

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | PARTIAL | Short section |
| B Why | ADEQUATE | Blocking I/O / cheap threads stated |
| C Mental model | PARTIAL | Pinning warned; carrier model lightly covered |
| D–F | ADEQUATE | Demo exists |
| J Practice | MISSING | |
| K Interview | PARTIAL | Scattered |
| L Progression | PARTIAL | Version history helps; teaching chapter is thin |

**Journey:** Discover PARTIAL · Understand PARTIAL · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview PARTIAL  

---

### 5.11 JVM

**Evidence:** `docs/02-learn/25-JVMAndMemory.md`; `pkg6jvm/jvm1`–`jvm3*.java`; `docs/04-reference/02-JVMInternals.md`; `docs/03-interview/05-JVM.md`; **no** A/B concept page (discovery inventory may list JVM & Memory separately).

| Dim | Class | Notes |
|-----|-------|-------|
| A–B | STRONG / ADEQUATE | JDK/JRE/JVM + GC roles |
| C Mental model | ADEQUATE | Heap/stack/metaspace tables; deeper detail in reference |
| D Syntax/API | PARTIAL | Mostly conceptual; flags shown |
| E–F | ADEQUATE | Memory areas demo explains heap vs stack with runtime output |
| J Practice | MISSING | |
| K Interview | STRONG | Dedicated JVM interview hub |
| L Progression | ADEQUATE | Lesson → demos → reference → interview |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice MISSING · Apply PARTIAL · Interview EXISTS  

---

### 5.12 Spring Boot

**Evidence:** `docs/02-learn/40-SpringBootIntro.md`; `pkg21spring/` (+ README); `projects/04-notes-api/`; `docs/03-interview/15-SpringBoot.md`; discovery coverage **D** (not in A/B concept routes).

| Dim | Class | Notes |
|-----|-------|-------|
| A–B | ADEQUATE | What Spring Boot is + core annotations table |
| C Mental model | PARTIAL | Auto-config/DI explained at catalog level, not deeply |
| D–E | ADEQUATE | Minimal controller snippet + Maven lab |
| F Code explanation | PARTIAL | File-by-file table; limited narrative walkthrough |
| H Practical | ADEQUATE | Real Notes API lab |
| J Practice | PARTIAL | Project is the practice; no graded exercises |
| K Interview | STRONG | Dedicated Spring Boot interview hub |
| L Progression | ADEQUATE | Prerequisites listed; path to ch.41 |

**Journey:** Discover EXISTS · Understand PARTIAL · See code EXISTS · Practice PARTIAL · Apply EXISTS · Interview EXISTS  

**Gaps:** No A/B concept landing. JPA appears inside the lab without a prior JPA teaching chapter.

---

### 5.13 REST API

**Evidence:** `docs/04-reference/07-RestApis.md`; `pkg12restapi/restapi1`–`5*.java`; lesson pointers from Spring/REST chapters; projects `03-todo-rest`, Notes API; interview coverage lighter than Spring.

| Dim | Class | Notes |
|-----|-------|-------|
| A–D | STRONG / ADEQUATE | Definition, verbs, status codes, URL design |
| E–F | STRONG | Concepts file is pedagogical; CRUD demo is runnable |
| H Practical | STRONG | In-process HTTP server demos |
| J Practice | PARTIAL | Projects exist; not framed as REST drills |
| K Interview | PARTIAL | Not a large dedicated REST interview hub like Collections |
| L Progression | ADEQUATE | Reference + package map → Spring |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice PARTIAL · Apply EXISTS · Interview PARTIAL  

---

### 5.14 JPA

**Evidence:** Embedded in Spring Boot lesson/`Note.java` entity; `docs/02-learn/30-JDBC.md` points to interview/reference; `docs/03-interview/16-JdbcJpaHibernate.md`; **no** dedicated `02-learn` JPA chapter found.

| Dim | Class | Notes |
|-----|-------|-------|
| A–C | PARTIAL | Encountered via Spring Data JPA / interview answers |
| D–E | PARTIAL | Entity/repository in `pkg21spring`; not a progressive JPA tutorial |
| F Explanation | PARTIAL | Interview Q&A style; lab README is thin |
| J Practice | PARTIAL | Notes API uses JPA incidentally |
| K Interview | STRONG | Large JDBC/JPA/Hibernate interview file |
| L Progression | PARTIAL | JDBC chapter → jump to Spring/JPA interview |

**Journey:** Discover PARTIAL · Understand PARTIAL · See code PARTIAL · Practice PARTIAL · Apply PARTIAL · Interview EXISTS  

**Gap:** Interview depth exceeds teaching depth. **Not established** that a learner can learn JPA from lessons alone without relying on interview answers or prior external knowledge.

---

### 5.15 Arrays

**Evidence:** `docs/02-learn/07-Arrays.md`; `pkg1core/core8ArraysDemo.java`; `pkg3datastructures/datastructures0DynamicArray.java`; LeetCode array problems; concept `/concepts/arrays`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–D | STRONG / ADEQUATE | Declaration, 2D, Arrays utilities, patterns |
| E–F | STRONG | Demo + DS dynamic array |
| J Practice | STRONG | Heavy LeetCode presence in concept inventory |
| K Interview | ADEQUATE | Appears in puzzles/core material |
| L Progression | STRONG | Foundation → DS → LeetCode |

**Journey:** Discover EXISTS · Understand EXISTS · See code EXISTS · Practice EXISTS · Apply PARTIAL · Interview PARTIAL  

---

### 5.16 Data Structures

**Evidence:** `docs/02-learn/22-DataStructures.md`; `pkg3datastructures/datastructures0`–`12*.java`; concept `/concepts/datastructures`.

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | ADEQUATE | Lesson is an ordered catalog |
| B Why | STRONG | “When to use what” decision guide |
| C Mental model | ADEQUATE | Complexity highlights; detail in each file header |
| D–F | STRONG | Implementations with complexity notes |
| G Mistakes | PARTIAL | Study method emphasizes edge cases; not catalogued in lesson |
| J Practice | PARTIAL | Suggested LRU exercise; limited LeetCode on concept |
| K Interview | PARTIAL | Print puzzles linked; not a DS interview hub |
| L Progression | STRONG | Clear file order + study ritual |

**Journey:** Discover EXISTS · Understand PARTIAL (per structure) · See code EXISTS · Practice PARTIAL · Apply PARTIAL · Interview PARTIAL  

---

### 5.17 Algorithms

**Evidence:** `docs/02-learn/23-Algorithms.md`; `pkg4algorithms/algorithms1`–`7*.java`; concept `/concepts/algorithms`.

| Dim | Class | Notes |
|-----|-------|-------|
| A–C | ADEQUATE | Package map + Big-O + pattern table |
| D–F | STRONG | Multi-algorithm demos |
| J Practice | PARTIAL | LeetCode chapter follows; concept LC count low |
| K Interview | PARTIAL | Pattern recognition helps interviews; few algo Q hubs |
| L Progression | ADEQUATE | Algorithms → LeetCode chapter |

**Journey:** Discover EXISTS · Understand PARTIAL · See code EXISTS · Practice PARTIAL · Apply PARTIAL · Interview PARTIAL  

---

### 5.18 HashMap

**Evidence:** Covered inside Collections lesson/demo; `pkg3datastructures/datastructures6HashTableImpl.java` (implements hashing); `docs/03-interview/03-Collections.md` (many HashMap questions); LeetCode usage; concept `/concepts/hashmap` (B; **0 lessons, 0 examples** in model—interview/LC only).

| Dim | Class | Notes |
|-----|-------|-------|
| A Definition | PARTIAL | As a row in Collections picker; not a HashMap chapter |
| B Why | PARTIAL | Implied by “key-value lookup” |
| C Mental model | PARTIAL | Internals mainly in interview answers + hash-table impl |
| D Syntax/API | PARTIAL | `HashMap` used in Collections demo |
| E Working code | PARTIAL | No dedicated `*HashMap*Demo` in concept examples list; DS hashtable is educational reimplementation |
| F Code explanation | PARTIAL | Strong on hashtable impl; weak as “java.util.HashMap API tour” |
| G Mistakes | PARTIAL | Interview covers null keys, resizing, etc. |
| J Practice | ADEQUATE | LeetCode entries on concept |
| K Interview | STRONG | Multiple HashMap-focused questions |
| L Progression | PARTIAL | Interview-first path for many learners arriving via search |

**Journey:** Discover PARTIAL · Understand PARTIAL · See code PARTIAL · Practice ADEQUATE · Apply PARTIAL · Interview EXISTS  

**Gap:** Concept search elevates HashMap, but **teaching materials do not form a complete Understand → See code path** comparable to Strings. Interview answers currently carry disproportionate explanatory load.

---

## 6. Resource evidence index (primary)

| Concept | Primary lesson | Primary code | Interview / reference / other |
|---------|----------------|--------------|-------------------------------|
| Strings | `02-learn/08-Strings.md` | `pkg1core/core9StringsDemo.java` | `03-interview/09-StringsAndPerformance.md` |
| Collections | `02-learn/17-Collections.md` | `pkg1core/core19CollectionsDemo.java` | `03-interview/03-Collections.md` |
| Exceptions | `02-learn/16-Exceptions.md` | `pkg1core/core18ExceptionsDemo.java` | `03-interview/07-Exceptions.md` |
| Generics | `02-learn/18-Generics.md` | `pkg1core/core20GenericsDemo.java` | `03-interview/08-Generics.md` |
| Streams | `02-learn/20-StreamsAndOptional.md` | `pkg1core/core22StreamsDemo.java` | `03-interview/06-Streams.md` |
| Optional | (same lesson) | `pkg1core/core23OptionalDemo.java` | Streams/Core interviews |
| Concurrency | `02-learn/26-Concurrency.md` | `pkg7concurrency/*`, `pkg16advconcurrency/*` | `03-interview/04-Concurrency.md`, `04-reference/11-MemoryModel.md` |
| CompletableFuture | (Concurrency) | `concurrency4CompletableFutureDemo.java` | Concurrency interviews |
| Executors | (Concurrency) | `concurrency3ExecutorsDemo.java` | Concurrency interviews |
| Virtual Threads | (Concurrency) | `concurrency6VirtualThreadsDemo.java` | Version/JEP pages |
| JVM | `02-learn/25-JVMAndMemory.md` | `pkg6jvm/*` | `04-reference/02-JVMInternals.md`, `03-interview/05-JVM.md` |
| Spring Boot | `02-learn/40-SpringBootIntro.md` | `pkg21spring/*` | `03-interview/15-SpringBoot.md`, project 04 |
| REST API | `04-reference/07-RestApis.md` | `pkg12restapi/*` | Projects 03–05; Spring lesson |
| JPA | (none dedicated) | `pkg21spring/Note*.java` | `03-interview/16-JdbcJpaHibernate.md` |
| Arrays | `02-learn/07-Arrays.md` | `core8ArraysDemo.java` | LeetCode array set |
| Data Structures | `02-learn/22-DataStructures.md` | `pkg3datastructures/*` | Print puzzles link |
| Algorithms | `02-learn/23-Algorithms.md` | `pkg4algorithms/*` | LeetCode chapter 24 |
| HashMap | (Collections only) | Collections demo + `datastructures6HashTableImpl.java` | Collections interviews + LC |

---

## 7. Learner journey analysis (summary)

| Concept | Discover | Understand | See code | Practice | Apply | Interview |
|---------|----------|------------|----------|----------|-------|-----------|
| Strings | EXISTS | EXISTS | EXISTS | EXISTS | PARTIAL | EXISTS |
| Collections | EXISTS | EXISTS | EXISTS | PARTIAL | PARTIAL | EXISTS |
| Exceptions | EXISTS | EXISTS | EXISTS | MISSING | PARTIAL | EXISTS |
| Generics | EXISTS | EXISTS | EXISTS | MISSING | PARTIAL | EXISTS |
| Streams | EXISTS | EXISTS | EXISTS | PARTIAL | PARTIAL | EXISTS |
| Optional | EXISTS | EXISTS | EXISTS | MISSING | PARTIAL | PARTIAL |
| Concurrency | EXISTS | PARTIAL | EXISTS | MISSING | PARTIAL | EXISTS |
| CompletableFuture | PARTIAL | PARTIAL | EXISTS | MISSING | PARTIAL | PARTIAL |
| Executors | PARTIAL | PARTIAL | EXISTS | MISSING | PARTIAL | PARTIAL |
| Virtual Threads | PARTIAL | PARTIAL | EXISTS | MISSING | PARTIAL | PARTIAL |
| JVM | EXISTS | EXISTS | EXISTS | MISSING | PARTIAL | EXISTS |
| Spring Boot | EXISTS | PARTIAL | EXISTS | PARTIAL | EXISTS | EXISTS |
| REST API | EXISTS | EXISTS | EXISTS | PARTIAL | EXISTS | PARTIAL |
| JPA | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | EXISTS |
| Arrays | EXISTS | EXISTS | EXISTS | EXISTS | PARTIAL | PARTIAL |
| Data Structures | EXISTS | PARTIAL | EXISTS | PARTIAL | PARTIAL | PARTIAL |
| Algorithms | EXISTS | PARTIAL | EXISTS | PARTIAL | PARTIAL | PARTIAL |
| HashMap | PARTIAL | PARTIAL | PARTIAL | ADEQUATE | PARTIAL | EXISTS |

---

## 8. Example deep dives

### 8.1 Strings — `pkg1core/core9StringsDemo.java`

- **Purpose (file header):** Immutability, methods, StringBuilder, text blocks, formatting.  
- **Explanation:** Header EXPLANATION aligns with lesson. Inline comments mark immutability proof and `==` vs `equals`.  
- **Learner verdict:** A learner can follow the demo **without unexplained assumptions** if they also read `08-Strings.md` (or the header alone for basics).  
- **Gap:** Does not explain when to prefer `formatted` vs `StringBuilder` beyond concat loops; performance demo is elsewhere.

### 8.2 Collections — `pkg1core/core19CollectionsDemo.java`

- **Purpose:** Framework tour List/Set/Map/Queue/Deque.  
- **Explanation:** Strong header; code demonstrates `merge` / `computeIfAbsent`.  
- **Learner verdict:** Usable as a **tour** companion. Does **not** teach HashMap internals.  
- **Gap:** No comment linking to `datastructures6HashTableImpl` or Collections interview internals.

### 8.3 Concurrency — `pkg7concurrency/concurrency1ThreadBasics.java`

- **Purpose:** Runnable vs Thread, start vs run, join, daemon.  
- **Explanation:** KEY POINTS header is clear; demos are self-contained.  
- **Learner verdict:** Strong first step.  
- **Gap:** Relationship to lesson’s numbered “Learning order” is easy to confuse with later files.

### 8.4 Streams — `pkg1core/core22StreamsDemo.java`

- **Purpose:** Pipelines + collectors.  
- **Explanation:** Laziness and purity stated in header; code shows grouping/partitioning.  
- **Learner verdict:** Strong. Assumes familiarity with `record` (introduced earlier in curriculum—established by prior chapters).  
- **Gap:** Parallel streams / performance pitfalls largely **NOT ESTABLISHED** here.

### 8.5 JVM — `pkg6jvm/jvm2MemoryAreasDemo.java`

- **Purpose:** Heap vs stack observation + recursion overflow.  
- **Explanation:** RUNTIME DATA AREAS header mirrors lesson tables; flags suggested.  
- **Learner verdict:** Concrete mental model for heap/stack. GC behavior is observational (`System.gc` hint), not a full GC tutorial.  
- **Gap:** Metaspace/classloading depth lives more in reference/interview than this demo.

### 8.6 Spring Boot — `pkg21spring` + `40-SpringBootIntro.md`

- **Purpose:** Minimal Notes API with JPA + REST.  
- **Explanation:** Lesson file-by-file table; README is short.  
- **Learner verdict:** Can **run** the app from instructions. Understanding Spring’s auto-configuration **beyond the table** is **NOT ESTABLISHED** by the lesson alone (interview file carries detail).  
- **Gap:** JPA concepts appear as labels (`@Entity`, `JpaRepository`) without a prior JPA lesson.

### 8.7 REST API — `pkg12restapi/restapi1RestConcepts.java` + `04-reference/07-RestApis.md`

- **Purpose:** Vocabulary map (methods, URLs, status codes).  
- **Explanation:** Pedagogical printout + reference doc; subsequent files implement servers.  
- **Learner verdict:** Strong conceptual on-ramp; later CRUD demo shows applied HTTP.  
- **Gap:** Auth/security beyond demos is thin; interview depth weaker than Spring.

---

## 9. Concrete content gaps (evidence-backed)

1. **HashMap:** Search/concept landing elevates the topic, but there is **no dedicated lesson**; understanding relies on Collections snippets + interview Q&A + optional hashtable reimplementation.  
2. **JPA:** Interview hub is deep; **no** `02-learn` JPA chapter; Spring lab assumes annotations.  
3. **CompletableFuture / Executors / Virtual Threads:** Runnable demos exist, but **Discover/Understand** depend on a short parent concurrency chapter; no A/B concept for Executors/Virtual Threads.  
4. **Concurrency learning-order list vs filenames:** Repository presents an ordered path that does not match file numbering—risk of learner confusion.  
5. **Practice gap for many Core topics:** Exceptions, Generics, Optional, Concurrency lack established exercise/LeetCode bridges in the concept inventories.  
6. **Streams naming collision:** API Streams vs I/O stream demos can surface together in concept/search inventories.  
7. **Spring Boot concept coverage D:** Product navigation (Phase 13) does not include a concept page; learners rely on Learn chapter + project.  
8. **Apply step weak across Core:** Few projects consume Core chapter skills until backend labs; Apply often **PARTIAL**.  
9. **Interview-first depth:** For HashMap and JPA, interview files currently hold explanations that lessons do not mirror.  
10. **Concept pages (Phase 13):** Navigation-only; they do **not** add educational prose—depth gaps remain in JavaForge sources.

---

## 10. Content ownership recommendations

| Gap | Most natural owner |
|-----|--------------------|
| HashMap teaching chapter / section | **LESSON** (expand Collections or new chapter) + optional **CODE EXAMPLE** (`*HashMap*Demo`) |
| HashMap internals for learners (non-interview) | **LESSON** or **CODE EXAMPLE** (link to `datastructures6HashTableImpl`) — not Interview-only |
| JPA fundamentals before Spring | **LESSON** (+ thin **REFERENCE**); keep Interview as prep |
| Align concurrency learning order with files | **LESSON** (edit map) and/or rename notes in **CODE EXAMPLE** headers |
| CompletableFuture / Executors / Virtual Threads discoverability | **CONCEPT PAGE** (if promoted to A/B) + short **LESSON** subsections |
| Practice bridges (Exceptions, Generics, Optional) | **PRACTICE** (LeetCode links / exercises) and/or **CONCEPT PAGE** inventory |
| Streams vs I/O streams disambiguation | **CONCEPT PAGE** metadata + **LESSON** clarifying sentence |
| Spring Boot concept landing | **CONCEPT PAGE** (coverage promotion) after content depth improves |
| Cross-links Collections ↔ HashTable impl ↔ Interview | **CROSS-LINKS** in LESSON / CONCEPT PAGE |
| REST interview depth | **INTERVIEW** (if desired) — currently not blocking REST learning |

Do **not** treat Interview as the primary teaching owner when a lesson gap exists—use Interview for preparation after teaching.

---

## 11. Future implementation categories (Phase 14+ planning only)

Proposed categories for later work (**do not implement in this phase**):

| ID | Category | Intent |
|----|----------|--------|
| A | Small lesson additions | Clarify subsections (HashMap, CF, Executors, VT, JPA intro) without rewriting whole curriculum |
| B | Example explanations | Strengthen headers/comments where demos outpace lessons |
| C | Missing examples | Dedicated HashMap API demo; JPA-only minimal demo if warranted |
| D | Cross-links | Lesson ↔ demo ↔ DS impl ↔ interview ↔ concept |
| E | Practice connections | Attach LeetCode/exercises where Practice is MISSING/PARTIAL |
| F | Interview connections | Point teaching material at existing Q hubs (not replace lessons) |
| G | Concept-page improvements | Inventory accuracy (Streams vs I/O), promote D-tier only after content exists |

---

## 12. Files that would likely be modified (future — not now)

If Phase 14 implementation proceeds later, **likely touch points** include:

- `JavaForge/docs/02-learn/17-Collections.md`, `26-Concurrency.md`, possibly new or expanded JPA/HashMap sections  
- `JavaForge/pkg1core/*Demo.java`, `pkg7concurrency/*`, optionally new demos  
- `JavaForge/docs/04-reference/*` for REST/JPA/JVM cross-links  
- `JavaForge-UI/docs/concepts.json` / concept build inventories (Streams disambiguation)  
- Concept page copy only after JavaForge teaching sources exist  

---

## 13. Files / repositories that MUST remain untouched (this audit phase)

| Target | Rule |
|--------|------|
| `JavaForge/**` content | **Must not change** in Phase 14 audit |
| `JavaMastery/**` | **Must not change** |
| `JavaMastery-UI/**` | **Must not change** |
| `JavaForge-UI` application code (`src/`, build scripts except docs) | **Must not change** for this audit |
| Search ranking / concept architecture | **Must not change** |
| Cloudflare / hosting config | **Must not change** |

**Allowed artifact for this phase:** `JavaForge-UI/docs/phase-14-content-depth-audit.md` only.

---

## 14. Strengths (evidence-backed)

- Core chapters with paired demos form a coherent **Understand + See code** path (Strings, Exceptions, Generics, Streams/Optional, Arrays).  
- Interview hubs are extensive and linked from lessons for Collections, Concurrency, JVM, Spring, Exceptions, Generics, Streams.  
- Data Structures and Algorithms packages provide **implementation-level** learning with complexity annotations.  
- REST `pkg12restapi` and Spring `pkg21spring` provide **Apply**-oriented labs.  
- Phase 13 concepts improve **Discover** for A/B topics without claiming to add depth.

---

## 15. Major gaps (evidence-backed)

- HashMap and JPA: **interview-heavy, lesson-light**.  
- Concurrency subtopics: code exists; **standalone teaching/discoverability** thin; learning-order inconsistency.  
- Practice bridges missing for several Core topics.  
- Spring Boot / Virtual Threads / Executors outside A/B concept slice despite learner relevance.  
- Apply step often waits until late backend projects.

---

*End of Phase 14 audit. No content or application changes performed.*
