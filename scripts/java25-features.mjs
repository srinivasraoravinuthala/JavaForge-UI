/**
 * JDK 25 feature index. Titles, release, and status follow the OpenJDK pages
 * fetched for this phase. Summaries are short restatements of each JEP summary,
 * not copies of the JEP text.
 *
 * List: https://openjdk.org/projects/jdk/25/
 * Categories and which release integrated each JEP:
 * https://openjdk.org/projects/jdk/25/jeps-since-jdk-21
 * Each feature also cites https://openjdk.org/jeps/<number>
 *
 * Status:
 * - Final: delivered in JDK 25 and not preview, incubator, or experimental
 * - Preview: official preview, disabled without --enable-preview
 * - Incubator: incubator API
 * - Experimental: JEP 509's own word. Delivered in JDK 25, not a permanent feature
 */

export const JAVA25_PAGE = '/versions/java-25'

export const JAVA25_FEATURES = [
  {
    jep: 512,
    title: 'Compact Source Files and Instance Main Methods',
    status: 'Final',
    category: 'Language',
    summary: 'Beginners can write a small program without the declarations used for large programs. The same language and tools still compile and run it.',
    history: 'Preview from JDK 21 (JEP 445) through JDK 24. Finalized in JDK 25. Earlier previews called the files simple source files.',
    jepUrl: 'https://openjdk.org/jeps/512',
  },
  {
    jep: 513,
    title: 'Flexible Constructor Bodies',
    status: 'Final',
    category: 'Language',
    summary: 'A constructor may run statements before super(...) or this(...). Those statements cannot use the object under construction.',
    history: 'Preview in JDK 22, JDK 23, and JDK 24. Finalized in JDK 25 without change.',
    jepUrl: 'https://openjdk.org/jeps/513',
  },
  {
    jep: 511,
    title: 'Module Import Declarations',
    status: 'Final',
    category: 'Language',
    summary: 'import module M imports the public types from the packages that module exports. The importing file does not itself have to be in a module.',
    history: 'Preview in JDK 23 (JEP 476) and JDK 24 (JEP 494). Finalized in JDK 25 without change.',
    jepUrl: 'https://openjdk.org/jeps/511',
  },
  {
    jep: 507,
    title: 'Primitive Types in Patterns, instanceof, and switch (Third Preview)',
    status: 'Preview',
    category: 'Language',
    summary: 'Pattern matching, instanceof, and switch can use primitive types. This is a preview language feature.',
    history: 'First preview in JDK 23 (JEP 455). Re-previewed without change in JDK 24 (JEP 488). JDK 25 is the third preview, again without change.',
    jepUrl: 'https://openjdk.org/jeps/507',
  },
  {
    jep: 506,
    title: 'Scoped Values',
    status: 'Final',
    category: 'Libraries',
    summary: 'A method can share immutable data with its callees and with child threads. Scoped values are easier to reason about than thread-local variables, and they cost less with virtual threads.',
    history: 'Incubated in JDK 20 (JEP 429). Previewed in JDK 21 through JDK 24. Finalized in JDK 25. ScopedValue.orElse no longer accepts null.',
    jepUrl: 'https://openjdk.org/jeps/506',
    lesson: { href: '/docs/04-reference--01-JavaVersions', title: 'Java versions reference' },
  },
  {
    jep: 510,
    title: 'Key Derivation Function API',
    status: 'Final',
    category: 'Security',
    summary: 'javax.crypto.KDF derives keys from a secret and other data. JDK 25 includes HKDF.',
    history: 'Preview in JDK 24 (JEP 478). Finalized in JDK 25 without change.',
    jepUrl: 'https://openjdk.org/jeps/510',
  },
  {
    jep: 470,
    title: 'PEM Encodings of Cryptographic Objects (Preview)',
    status: 'Preview',
    category: 'Libraries',
    summary: 'A preview API encodes and decodes cryptographic keys, certificates, and certificate revocation lists in the PEM format.',
    history: 'Preview in JDK 25. The JEP says the API is disabled unless preview features are enabled.',
    jepUrl: 'https://openjdk.org/jeps/470',
  },
  {
    jep: 502,
    title: 'Stable Values (Preview)',
    status: 'Preview',
    category: 'Libraries',
    summary: 'A stable value holds immutable data and can be initialized later than a final field, while still allowing constant-folding. This is a preview API.',
    history: 'Preview in JDK 25.',
    jepUrl: 'https://openjdk.org/jeps/502',
  },
  {
    jep: 505,
    title: 'Structured Concurrency (Fifth Preview)',
    status: 'Preview',
    category: 'Libraries',
    summary: 'A preview API treats related tasks in different threads as one unit of work, so cancellation and errors stay with that unit.',
    history: 'Incubated in JDK 19 and JDK 20. Preview since JDK 21. JDK 25 is the fifth preview: a StructuredTaskScope opens through static factory methods, not public constructors. The curriculum file still needs --enable-preview and its comment shows the older constructor shape.',
    jepUrl: 'https://openjdk.org/jeps/505',
    lesson: { href: '/docs/04-reference--11-MemoryModel', title: 'Java Memory Model' },
    example: { href: '/examples/pkg16advconcurrency/advconcurrency7StructuredConcurrency', title: 'advconcurrency7StructuredConcurrency.java' },
  },
  {
    jep: 508,
    title: 'Vector API (Tenth Incubator)',
    status: 'Incubator',
    category: 'Libraries',
    summary: 'An incubator API expresses vector computations that the runtime can compile to vector instructions on supported CPUs.',
    history: 'Incubating since JDK 16 (JEP 338). JDK 25 is the tenth incubation. The JEP says it stays in incubation until the Project Valhalla features it needs are available as previews.',
    jepUrl: 'https://openjdk.org/jeps/508',
  },
  {
    jep: 503,
    title: 'Remove the 32-bit x86 Port',
    status: 'Final',
    category: 'JVM',
    summary: 'JDK 25 removes source and build support for the 32-bit x86 port. Other 32-bit architectures are unchanged.',
    history: 'Deprecated for removal in JDK 24 (JEP 501). Removed in JDK 25.',
    jepUrl: 'https://openjdk.org/jeps/503',
  },
  {
    jep: 514,
    title: 'Ahead-of-Time Command-Line Ergonomics',
    status: 'Final',
    category: 'JVM',
    summary: 'A common ahead-of-time cache can be created with one java launch, using -XX:AOTCacheOutput, instead of a separate record step and create step.',
    history: 'Simplifies the two-step AOT cache workflow added in JDK 24 (JEP 483). It does not add a new optimization.',
    jepUrl: 'https://openjdk.org/jeps/514',
  },
  {
    jep: 515,
    title: 'Ahead-of-Time Method Profiling',
    status: 'Final',
    category: 'JVM',
    summary: 'Method-execution profiles from a training run can be stored in the AOT cache, so the JIT can compile hot methods sooner when the application starts.',
    history: 'Extends the AOT cache from JEP 483. Production runs can still collect new profiles.',
    jepUrl: 'https://openjdk.org/jeps/515',
  },
  {
    jep: 518,
    title: 'JFR Cooperative Sampling',
    status: 'Final',
    category: 'JVM',
    summary: 'JDK Flight Recorder records a stack sample request immediately, then walks the Java stack at the next safepoint, instead of parsing stacks with unsafe heuristics.',
    history: 'Delivered in JDK 25. JEP 509 builds on this mechanism.',
    jepUrl: 'https://openjdk.org/jeps/518',
  },
  {
    jep: 509,
    title: 'JFR CPU-Time Profiling (Experimental)',
    status: 'Experimental',
    category: 'JVM',
    summary: 'On Linux, JDK Flight Recorder can sample threads by CPU time rather than wall-clock time. The JEP says this is an experimental feature.',
    history: 'Delivered in JDK 25. The jdk.CPUTimeSample event is off by default and tagged @Experimental. It does not need -XX:+UnlockExperimentalVMOptions. It is not a permanent API.',
    jepUrl: 'https://openjdk.org/jeps/509',
  },
  {
    jep: 520,
    title: 'JFR Method Timing & Tracing',
    status: 'Final',
    category: 'JVM',
    summary: 'JDK Flight Recorder can time and trace selected methods by instrumenting bytecode. The application source does not have to change.',
    history: 'Delivered in JDK 25.',
    jepUrl: 'https://openjdk.org/jeps/520',
  },
  {
    jep: 519,
    title: 'Compact Object Headers',
    status: 'Final',
    category: 'JVM',
    summary: 'Compact object headers change from an experimental option to a product feature. They are not the default layout.',
    history: 'Experimental in JDK 24 (JEP 450). In JDK 25, -XX:+UseCompactObjectHeaders no longer requires -XX:+UnlockExperimentalVMOptions.',
    jepUrl: 'https://openjdk.org/jeps/519',
  },
  {
    jep: 521,
    title: 'Generational Shenandoah',
    status: 'Final',
    category: 'JVM',
    summary: 'Shenandoah’s generational mode becomes a product feature. The default Shenandoah mode is still a single generation.',
    history: 'Experimental in JDK 24 (JEP 404). In JDK 25 the generational mode no longer requires -XX:+UnlockExperimentalVMOptions.',
    jepUrl: 'https://openjdk.org/jeps/521',
    lesson: { href: '/docs/04-reference--02-JVMInternals', title: 'JVM internals' },
  },
]
