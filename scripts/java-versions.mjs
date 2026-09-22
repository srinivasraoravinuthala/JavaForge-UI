/**
 * Java 6–25 version curriculum.
 *
 * Java 25 features are the verified list in java25-features.mjs.
 * Release months and JSR numbers: https://docs.oracle.com/javase/specs/
 * Java 6 final-release date: https://jcp.org/en/jsr/detail?id=270
 * JDK 9 features: https://openjdk.java.net/projects/jdk9/
 * JDK 10–25 features: https://openjdk.org/projects/jdk/<version>/
 * Java 6–8 library notes also follow JavaForge docs/04-reference/01-JavaVersions.md.
 * A feature name keeps Preview, Incubator, or Experimental when that was its status
 * in that release. Later pages do not rewrite the earlier status.
 */
import { JAVA25_FEATURES, JAVA25_PAGE } from './java25-features.mjs'

export const VERSION_INDEX = '/versions'

const L = 'Language'
const A = 'APIs / Libraries'
const R = 'JVM / Runtime'
const T = 'Tools / Platform'

const lesson = (href, title) => ({ href, title })
const file = (name, note, exampleType, requiredJava) => ({
  href: `/examples/pkg2versions/${name}`,
  title: `${name}.java`,
  note,
  exampleType,
  requiredJava,
})

const v2 = file('versions2Java7Features', 'Try-with-resources, the diamond, a string switch, multi-catch, underscores, and binary literals. The switch uses colon labels and break.', 'Java 7 example', 7)
const v3 = file('versions3Java8Features', 'Lambdas, a default method, method references, streams, Optional, and java.time.', 'Java 8 example', 8)
const v4 = file('versions4Java9To11Features', 'List.of and takeWhile are Java 9. var is Java 10. The String methods are Java 11. The whole file requires Java 11. It uses Collectors.toList(), not Stream.toList().', 'Cumulative Java 9–11 example', 11)
const v5 = file('versions5Java17Features', 'Final forms only: switch expressions from Java 14, text blocks from Java 15, records and instanceof patterns from Java 16, and sealed classes from Java 17. This is not a Java 12 preview program. Pattern matching for switch was still a preview in Java 17 and is not used.', 'Cumulative Java 12–17 example', 17)
const v6 = file('versions6Java21Features', 'Virtual threads, record patterns, pattern matching for switch, and sequenced collections, in their Java 21 final form. String templates, structured concurrency, and scoped values were previews and are not shown.', 'Java 21 example', 21)
const v6modern = {
  ...v6,
  exampleType: 'Modern Java 21 example',
  note: 'Virtual threads, record patterns, and pattern matching for switch were previews in Java 19 and became final in Java 21. This source requires Java 21. It is not a Java 19 program.',
}
const v7 = file('versions7Java22Unnamed', 'An unnamed loop variable and an unnamed catch parameter. Final in Java 22. The preview was Java 21.', 'Java 22 example', 22)
const v8 = file('versions8Java24Gatherers', 'Gatherers.windowFixed on a stream. Final in Java 24. The previews were Java 22 and Java 23.', 'Java 24 example', 24)
const v9 = file('versions9Java25ScopedValues', 'ScopedValue.where(...).run(...). Final in Java 25. Incubated in Java 20 and previewed in Java 21 through Java 24. This file is not a Java 20 program.', 'Java 25 example', 25)
const v10 = file('versions10Java25FlexibleConstructors', 'A constructor checks a value before super(...). Final in Java 25. Preview in Java 22, Java 23, and Java 24.', 'Java 25 example', 25)
const v11 = file('versions11Java25ModuleImport', 'import module java.base, then List.of without a package import. Final in Java 25. Preview in Java 23 and Java 24.', 'Java 25 example', 25)
const virtualThreads = {
  href: '/examples/pkg7concurrency/concurrency6VirtualThreadsDemo',
  title: 'concurrency6VirtualThreadsDemo.java',
  note: 'Virtual threads in the concurrency chapter. Thread.ofVirtual is the final Java 21 API. In Java 21 a virtual thread can stay pinned inside synchronized; Java 24 changed that.',
  exampleType: 'Java 21 example',
  requiredJava: 21,
}
const structured = {
  href: '/examples/pkg16advconcurrency/advconcurrency7StructuredConcurrency',
  title: 'advconcurrency7StructuredConcurrency.java',
  note: 'The main method uses CompletableFuture and runs without --enable-preview. The comment shows the Java 25 preview API: StructuredTaskScope.open with a Joiner. JEP 505 is still a preview.',
  exampleType: 'Stable demo; Java 25 preview API is only in the comment',
  requiredJava: 8,
}

export const EXAMPLE_COMPAT = {
  versions1Java5Features: { requiredJava: 5, exampleType: 'Java 5 example' },
  versions2Java7Features: { requiredJava: 7, exampleType: 'Java 7 example' },
  versions3Java8Features: { requiredJava: 8, exampleType: 'Java 8 example' },
  versions4Java9To11Features: { requiredJava: 11, exampleType: 'Cumulative Java 9–11 example' },
  versions5Java17Features: { requiredJava: 17, exampleType: 'Cumulative Java 12–17 example' },
  versions6Java21Features: { requiredJava: 21, exampleType: 'Java 21 example' },
  versions7Java22Unnamed: { requiredJava: 22, exampleType: 'Java 22 example' },
  versions8Java24Gatherers: { requiredJava: 24, exampleType: 'Java 24 example' },
  versions9Java25ScopedValues: { requiredJava: 25, exampleType: 'Java 25 example' },
  versions10Java25FlexibleConstructors: { requiredJava: 25, exampleType: 'Java 25 example' },
  versions11Java25ModuleImport: { requiredJava: 25, exampleType: 'Java 25 example' },
  concurrency6VirtualThreadsDemo: { requiredJava: 21, exampleType: 'Java 21 example' },
  advconcurrency7StructuredConcurrency: { requiredJava: 8, exampleType: 'Stable demo; Java 25 preview API is only in the comment' },
}

const link = (item) => ({ href: item.href, title: item.title })

function feature(id, name, category, status, summary, extra = {}) {
  return {
    id,
    name,
    category,
    status,
    summary,
    history: extra.history ?? null,
    jep: extra.jep ?? null,
    jepUrl: extra.jep ? `https://openjdk.org/jeps/${extra.jep}` : null,
    lesson: extra.lesson ?? null,
    example: extra.example ?? null,
  }
}

function jep(number, name, category, status, summary, extra = {}) {
  return feature(`jep-${number}`, name, category, status, summary, { ...extra, jep: number })
}

const streams = lesson('/docs/02-learn--20-StreamsAndOptional', 'Streams and Optional')
const lambdas = lesson('/docs/02-learn--19-LambdasAndFunctional', 'Lambdas and functional programming')
const modules = lesson('/docs/02-learn--34-Modules', 'Modules and SPI')
const records = lesson('/docs/02-learn--15-RecordsAndSealed', 'Records and sealed classes')
const concurrency = lesson('/docs/02-learn--26-Concurrency', 'Concurrency')
const collections = lesson('/docs/02-learn--17-Collections', 'Collections')
const control = lesson('/docs/02-learn--04-ControlFlow', 'Control flow')
const strings = lesson('/docs/02-learn--08-Strings', 'Strings')
const networking = lesson('/docs/02-learn--29-Networking', 'Networking and HTTP')
const io = lesson('/docs/02-learn--28-IOAndNIO', 'File I/O and NIO')
const jvm = lesson('/docs/02-learn--25-JVMAndMemory', 'JVM and memory')
const exceptions = lesson('/docs/02-learn--16-Exceptions', 'Exceptions')
const versionChapter = lesson('/docs/02-learn--21-JavaVersions', 'Version chapter, Java 5 through Java 21')

function release(version, fields) {
  return {
    version,
    url: `/versions/java-${version}`,
    lts: false,
    projectUrl: version >= 10 ? `https://openjdk.org/projects/jdk/${version}/` : version === 9 ? 'https://openjdk.java.net/projects/jdk9/' : 'https://docs.oracle.com/javase/specs/',
    also: null,
    historical: null,
    examples: [],
    ...fields,
  }
}

const earlier = [
  release(6, {
    ga: '11 December 2006',
    spec: 'JSR 270',
    description: 'Java SE 6, JSR 270, reached its final release on 11 December 2006. The release is library and runtime work, not a new syntax.',
    overview: 'Java SE 6 is the reference platform defined by JSR 270. The JCP recorded its final release on 11 December 2006. This release has almost no new language syntax. The changes developers met were libraries, tooling, and runtime work.',
    sources: 'Final release date and JSR 270: JCP. Release month: Oracle Java SE specifications. Feature notes: the Java versions reference in this curriculum.',
    features: [
      feature('java6-scripting', 'Scripting API', A, 'Final', 'javax.script embeds scripting languages. The curriculum reference cites JSR 223 for this API.'),
      feature('java6-jdbc', 'JDBC 4.0', A, 'Final', 'JDBC 4.0 is the database API update that shipped with this platform. The curriculum reference lists it as a library change, not a language change.'),
      feature('java6-annotations', 'Pluggable annotation processing', T, 'Final', 'Annotation processors can run as part of compilation. The curriculum reference lists this beside the scripting API and JDBC 4.0.'),
      feature('java6-runtime', 'Runtime and performance work', R, 'Final', 'Java 6 is remembered for JVM and library performance work. This page does not invent a language feature to fill that gap.', { lesson: jvm }),
    ],
    historical: 'The version chapter still starts at Java 5. That example stays at versions1Java5Features.java. Java 6 has no sample of its own. The scripting API needs an engine this JDK no longer includes, JDBC needs a driver, and annotation processing is not one self-contained program.',
    examples: [],
  }),
  release(7, {
    ga: 'July 2011',
    spec: 'JSR 336',
    description: 'Java SE 7, JSR 336, was released in July 2011. Project Coin, NIO.2, Fork/Join, and invokedynamic are the developer-facing changes.',
    overview: 'Java SE 7 is JSR 336. Oracle’s specification index dates the release to July 2011. The language changes are the small Project Coin set. The larger library and JVM changes are NIO.2, Fork/Join, and invokedynamic.',
    sources: 'Release month and JSR 336: Oracle Java SE specifications. Feature set: the Java versions reference and versions2Java7Features.java in this curriculum.',
    features: [
      feature('java7-try', 'try-with-resources', L, 'Final', 'A resource that implements AutoCloseable is closed when the try block ends, in reverse order of acquisition.', { lesson: exceptions, example: link(v2) }),
      feature('java7-diamond', 'Diamond operator', L, 'Final', 'The constructor type arguments can be omitted when the variable’s type already supplies them.', { example: link(v2) }),
      feature('java7-switch', 'Strings in switch', L, 'Final', 'A switch can select on a string. The example uses the Java 7 form: colon labels and break, not arrow labels.', { lesson: control, example: link(v2) }),
      feature('java7-multicatch', 'Multi-catch', L, 'Final', 'One catch clause can list more than one exception type.', { lesson: exceptions, example: link(v2) }),
      feature('java7-literals', 'Binary literals and underscores', L, 'Final', 'Integer literals can be written in binary, and underscores can separate digits.', { example: link(v2) }),
      feature('java7-nio', 'NIO.2', A, 'Final', 'java.nio.file adds Path and Files for file-system work that the older File API did not cover well.', { lesson: io }),
      feature('java7-forkjoin', 'Fork/Join', A, 'Final', 'A work-stealing pool for divide-and-conquer tasks. It is a library, not the virtual-thread API that arrives later.', { lesson: concurrency }),
      feature('java7-indy', 'invokedynamic', R, 'Final', 'A JVM instruction for dynamic call sites. Java 8 lambdas later depend on this kind of linkage. It is not a new expression in Java 7 source.'),
    ],
    historical: 'The Java 7 example uses only Project Coin syntax: diamond, try-with-resources, a colon string switch, multi-catch, underscores, and binary literals. It does not use lambdas or switch arrows.',
    examples: [v2],
  }),
  release(8, {
    ga: 'March 2014',
    spec: 'JSR 337',
    lts: true,
    description: 'Java SE 8, JSR 337, was released in March 2014. Lambdas, streams, Optional, java.time, and default methods are the language and library changes.',
    overview: 'Java SE 8 is JSR 337, released in March 2014. Oracle and other vendors have treated it as a long-term support line. This is the functional release: lambdas, the stream library, Optional, and java.time. The chapters on lambdas and streams teach those topics in depth. This page only says what arrived.',
    sources: 'Release month and JSR 337: Oracle Java SE specifications. Feature set: the Java versions reference and versions3Java8Features.java.',
    features: [
      feature('java8-lambdas', 'Lambda expressions', L, 'Final', 'A lambda implements a functional interface without an anonymous class. It does not have its own this.', { lesson: lambdas, example: link(v3) }),
      feature('java8-functional', 'Functional interfaces', L, 'Final', 'java.util.function supplies the common single-method types the new APIs accept, such as Predicate, Function, and Consumer.', { lesson: lambdas, example: link(v3) }),
      feature('java8-refs', 'Method references', L, 'Final', 'A method reference points at an existing method or constructor where a functional interface is required.', { lesson: lambdas, example: link(v3) }),
      feature('java8-default', 'Default and static interface methods', L, 'Final', 'An interface can carry a default instance method and a static method. That is how Collection gained stream() without breaking existing classes.', { lesson: lesson('/docs/02-learn--13-AbstractionAndInterfaces', 'Abstraction and interfaces'), example: link(v3) }),
      feature('java8-streams', 'Stream API', A, 'Final', 'A stream is a pipeline of intermediate operations and one terminal operation. Intermediate work stays lazy until the terminal operation runs.', { lesson: streams, example: link(v3) }),
      feature('java8-optional', 'Optional', A, 'Final', 'Optional is a return type for a value that may be absent. The stream chapter covers how to use it.', { lesson: streams, example: link(v3) }),
      feature('java8-time', 'java.time', A, 'Final', 'The java.time package replaces the mutable java.util.Date and Calendar model for civil dates, times, and instants.', { example: link(v3) }),
      feature('java8-cfe', 'CompletableFuture', A, 'Final', 'A completion stage composes asynchronous work. It is not the virtual-thread API. Virtual threads arrive as a preview in Java 19 and become final in Java 21.', { lesson: concurrency }),
      feature('java8-metaspace', 'Metaspace', R, 'Final', 'Class metadata moves from the fixed PermGen space to Metaspace. This is a JVM change, not a source change.', { lesson: jvm }),
      feature('java8-nashorn', 'Nashorn', T, 'Final', 'Nashorn is a JavaScript engine that shipped in Java 8. Java 11 deprecates it. Java 15 removes it.'),
    ],
    historical: 'Java 8 is the baseline many later migrations leave. The Java 11 page lists what changed between these two long-lived releases, without ranking them.',
    examples: [v3],
  }),
  release(9, {
    ga: '21 September 2017',
    spec: 'JSR 379',
    description: 'JDK 9, JSR 379, reached general availability on 21 September 2017. The module system, jshell, collection factories, and an incubator HTTP client are the headline changes.',
    overview: 'JDK 9 is the reference implementation of Java SE 9, JSR 379. General availability was 21 September 2017. The module system is the large change. jshell, collection factories, and process-API updates are the everyday ones. The HTTP client in this release is an incubator API, not the standard client.',
    sources: 'General availability and the JEP list: OpenJDK JDK 9. JSR 379: Oracle Java SE specifications.',
    features: [
      jep(261, 'Module System', L, 'Final', 'A module names the packages it exports and the modules it requires. The platform itself is modular.', { lesson: modules }),
      jep(222, 'jshell', T, 'Final', 'jshell is a read-eval-print loop for Java statements and expressions. It is a tool, not a library you import.'),
      jep(269, 'Convenience Factory Methods for Collections', A, 'Final', 'List.of, Set.of, and Map.of build immutable collections and reject null elements.', { lesson: collections, example: link(v4) }),
      jep(213, 'Milling Project Coin', L, 'Final', 'Small language follow-ups, including private interface methods, the diamond on anonymous classes, and try-with-resources on effectively final variables.'),
      feature('java9-streams', 'Stream additions', A, 'Final', 'takeWhile, dropWhile, and a new iterate overload arrive on Stream. The shared example collects with Collectors.toList(), which already existed in Java 8. The whole file still requires Java 11.', { lesson: streams, example: link(v4) }),
      jep(102, 'Process API Updates', A, 'Final', 'ProcessHandle can identify and inspect native processes, including the current one.'),
      jep(110, 'HTTP/2 Client (Incubator)', A, 'Incubator', 'An incubator HTTP client ships in jdk.incubator.httpclient. It is not a supported standard API in Java 9.', { history: 'Standardized in Java 11 by JEP 321 as java.net.http.HttpClient.', lesson: networking }),
      jep(266, 'More Concurrency Updates', A, 'Final', 'java.util.concurrent.Flow publishes the reactive-streams interfaces. CompletableFuture also gains more composition methods.', { lesson: concurrency }),
      jep(282, 'jlink', T, 'Final', 'jlink builds a custom runtime image with the modules an application needs. It is part of the module tooling, not a language feature.', { lesson: modules }),
      jep(248, 'Make G1 the Default Garbage Collector', R, 'Final', 'G1 becomes the default collector. Collectors that were already deprecated are not the story of this release.', { lesson: jvm }),
      jep(238, 'Multi-Release JAR Files', T, 'Final', 'One JAR can contain class files for more than one Java release, so a library can use newer APIs where they exist.'),
    ],
    also: 'The OpenJDK JDK 9 page lists many more JEPs, including the modular JDK image (JEP 220), compact strings (JEP 254), and the stack-walking API (JEP 259). Those are not separate lessons here.',
    historical: 'The module chapter teaches how modules work. This page only records that they became part of the platform in Java 9.',
    examples: [v4],
  }),
  release(10, {
    ga: '20 March 2018',
    spec: 'JSR 383',
    description: 'JDK 10, JSR 383, reached general availability on 20 March 2018. Local-variable type inference is the language change.',
    overview: 'JDK 10 is Java SE 10, JSR 383, generally available on 20 March 2018. One language change dominates the release: local-variable type inference. The rest is runtime and platform bookkeeping, including the time-based version numbers used from here on.',
    sources: 'General availability, JSR 383, and the JEP list: OpenJDK JDK 10.',
    features: [
      jep(286, 'Local-Variable Type Inference', L, 'Final', 'var asks the compiler to infer the type of a local variable that has an initializer. It is not allowed for fields, parameters, or method return types.', { lesson: lesson('/docs/02-learn--02-VariablesAndTypes', 'Variables and types'), example: link(v4), history: 'Java 11 adds var for the parameters of implicitly typed lambdas (JEP 323). That does not extend var to fields.' }),
      jep(307, 'Parallel Full GC for G1', R, 'Final', 'G1’s full collection can use multiple threads. This does not change the default collector, which became G1 in Java 9.', { lesson: jvm }),
      jep(310, 'Application Class-Data Sharing', R, 'Final', 'Application classes can be stored in a class-data sharing archive, so later runs spend less time loading them.'),
      jep(322, 'Time-Based Release Versioning', T, 'Final', 'Version numbers follow the six-month release train. A feature release is no longer a long list of unrelated milestones.'),
      jep(317, 'Experimental Java-Based JIT Compiler', R, 'Experimental', 'A Java-based JIT compiler is available as an experimental alternative. It is not the default HotSpot compiler.'),
    ],
    historical: 'The shared file demonstrates var, and also Java 9 factories and Java 11 String methods. It requires Java 11. It is not a Java 10 program.',
    examples: [v4],
  }),
  release(11, {
    ga: '25 September 2018',
    spec: 'JSR 384',
    lts: true,
    description: 'JDK 11, JSR 384, reached general availability on 25 September 2018. The HTTP client becomes standard, and Java EE and CORBA modules are removed.',
    overview: 'JDK 11 is Java SE 11, JSR 384, generally available on 25 September 2018. Vendors treat it as a long-term support release. The HTTP client leaves the incubator. Single-file source programs can be launched with the java command. Java EE and CORBA modules are removed from the JDK.',
    sources: 'General availability, JSR 384, and the JEP list: OpenJDK JDK 11.',
    features: [
      jep(321, 'HTTP Client (Standard)', A, 'Final', 'java.net.http.HttpClient is a standard API. It supports HTTP/1.1 and HTTP/2.', { history: 'Incubated in Java 9 as JEP 110. This release makes it standard.', lesson: networking }),
      jep(330, 'Launch Single-File Source-Code Programs', T, 'Final', 'java Hello.java compiles and runs one source file. The source file still has to be a valid program for that JDK.'),
      jep(323, 'Local-Variable Syntax for Lambda Parameters', L, 'Final', 'An implicitly typed lambda can write its parameters with var. That does not allow var on ordinary method parameters.', { history: 'Local-variable var arrived in Java 10 (JEP 286).' }),
      feature('java11-string', 'String and file helpers', A, 'Final', 'String gains isBlank, strip, lines, and repeat. Files gains readString and writeString. These are library methods, not a separate language.', { lesson: strings, example: link(v4) }),
      jep(328, 'Flight Recorder', R, 'Final', 'JDK Flight Recorder is part of OpenJDK. It records runtime events with low overhead.', { lesson: jvm }),
      jep(333, 'ZGC (Experimental)', R, 'Experimental', 'ZGC is a low-latency collector. In Java 11 it is experimental, not the default, and not a finished product feature.', { history: 'It becomes a product feature in Java 15 (JEP 377).', lesson: jvm }),
      jep(332, 'Transport Layer Security (TLS) 1.3', A, 'Final', 'The JDK implements TLS 1.3.'),
      jep(320, 'Remove the Java EE and CORBA Modules', A, 'Final', 'Modules such as java.xml.ws, java.xml.bind, and the CORBA modules are removed from the JDK. Applications that used them need those libraries on the classpath or module path.'),
      jep(335, 'Deprecate the Nashorn JavaScript Engine', T, 'Final', 'Nashorn is deprecated and marked for removal. It is still present in Java 11.', { history: 'Removed in Java 15 by JEP 372.' }),
    ],
    also: 'Also in this release: nest-based access control (JEP 181), dynamic class-file constants (JEP 309), ChaCha20 and Poly1305 (JEP 329), and Unicode 10 (JEP 327).',
    historical: 'Since Java 8, Java 9 added modules and Java 10 added local var. Java 11 standardizes the HTTP client and removes the Java EE and CORBA modules. That is a change in the platform, not a claim that one release is better.',
    examples: [v4],
  }),
  release(12, {
    ga: '19 March 2019',
    spec: 'JSR 386',
    description: 'JDK 12, JSR 386, reached general availability on 19 March 2019. Switch expressions are a preview. Shenandoah is experimental.',
    overview: 'JDK 12 is Java SE 12, JSR 386, generally available on 19 March 2019. There is no new permanent language feature. Switch expressions are a preview. Shenandoah is an experimental collector. G1 gains two latency-oriented changes.',
    sources: 'General availability, JSR 386, and the JEP list: OpenJDK JDK 12.',
    features: [
      jep(325, 'Switch Expressions (Preview)', L, 'Preview', 'A switch can be an expression that yields a value. The preview form is disabled unless preview features are enabled.', { history: 'Preview again in Java 13 (JEP 354). Standard in Java 14 (JEP 361).', lesson: control }),
      jep(189, 'Shenandoah: A Low-Pause-Time Garbage Collector (Experimental)', R, 'Experimental', 'Shenandoah does evacuation work concurrently to keep pauses short. In Java 12 it is experimental.', { history: 'It becomes a product feature in Java 15 (JEP 379).', lesson: jvm }),
      jep(344, 'Abortable Mixed Collections for G1', R, 'Final', 'G1 can abort a mixed collection that is taking too long, so a pause is more likely to meet its goal.'),
      jep(346, 'Promptly Return Unused Committed Memory from G1', R, 'Final', 'G1 can return unused Java heap memory to the operating system during idle time.'),
      jep(341, 'Default CDS Archives', R, 'Final', 'The JDK ships a default class-data sharing archive, so the feature is available without a separate dump step.'),
    ],
    historical: 'The final switch-expression syntax is in the Java 17 cumulative example, which is not a Java 12 program. Java 12’s own switch work was a preview.',
    examples: [v5],
  }),
  release(13, {
    ga: '17 September 2019',
    spec: 'JSR 388',
    description: 'JDK 13, JSR 388, reached general availability on 17 September 2019. Text blocks and switch expressions are both previews.',
    overview: 'JDK 13 is Java SE 13, JSR 388, generally available on 17 September 2019. Two language features are in preview: text blocks, for the first time, and switch expressions, again. Neither is a permanent part of the language yet.',
    sources: 'General availability, JSR 388, and the JEP list: OpenJDK JDK 13.',
    features: [
      jep(355, 'Text Blocks (Preview)', L, 'Preview', 'A text block is a multi-line string literal. In Java 13 it is a preview.', { history: 'Second preview in Java 14 (JEP 368). Standard in Java 15 (JEP 378).', lesson: strings }),
      jep(354, 'Switch Expressions (Preview)', L, 'Preview', 'Switch expressions are previewed again, with changes from the Java 12 preview. They are still not standard.', { history: 'First preview in Java 12 (JEP 325). Standard in Java 14 (JEP 361).', lesson: control }),
      jep(353, 'Reimplement the Legacy Socket API', R, 'Final', 'The java.net socket implementation is replaced with a simpler one. The NioSocketImpl work continues later. Application source usually does not change.'),
      jep(350, 'Dynamic CDS Archives', R, 'Final', 'An application run can generate a class-data sharing archive, extending the default archive from Java 12.'),
      jep(351, 'ZGC: Uncommit Unused Memory', R, 'Final', 'ZGC can return unused heap memory to the operating system. ZGC is still experimental in this release.', { history: 'ZGC became experimental in Java 11 (JEP 333) and a product feature in Java 15 (JEP 377).' }),
    ],
    historical: 'Text blocks in the Java 17 example are the final form from Java 15, not the Java 13 preview.',
    examples: [v5],
  }),
  release(14, {
    ga: '17 March 2020',
    spec: 'JSR 389',
    description: 'JDK 14, JSR 389, reached general availability on 17 March 2020. Switch expressions become standard. Records and instanceof patterns are previews.',
    overview: 'JDK 14 is Java SE 14, JSR 389, generally available on 17 March 2020. Switch expressions become a permanent language feature. Records, pattern matching for instanceof, and text blocks are still previews. Helpful NullPointerExceptions are on by default.',
    sources: 'General availability, JSR 389, and the JEP list: OpenJDK JDK 14.',
    features: [
      jep(361, 'Switch Expressions (Standard)', L, 'Final', 'A switch expression yields a value, uses arrow labels, and does not fall through those labels.', { history: 'Preview in Java 12 (JEP 325) and Java 13 (JEP 354).', lesson: control, example: link(v5) }),
      jep(359, 'Records (Preview)', L, 'Preview', 'A record is a preview way to declare a shallowly immutable carrier of data. It is not final in Java 14.', { history: 'Second preview in Java 15 (JEP 384). Final in Java 16 (JEP 395).', lesson: records }),
      jep(305, 'Pattern Matching for instanceof (Preview)', L, 'Preview', 'instanceof can bind the tested value to a pattern variable. This is a preview.', { history: 'Second preview in Java 15 (JEP 375). Final in Java 16 (JEP 394).' }),
      jep(368, 'Text Blocks (Second Preview)', L, 'Preview', 'Text blocks are previewed a second time. They are not yet a permanent literal.', { history: 'First preview in Java 13 (JEP 355). Final in Java 15 (JEP 378).', lesson: strings }),
      jep(358, 'Helpful NullPointerExceptions', R, 'Final', 'A NullPointerException can name which part of an expression was null. The feature is on by default.'),
      jep(370, 'Foreign-Memory Access API (Incubator)', A, 'Incubator', 'An incubator API reaches memory outside the Java heap. It is not a supported standard API.', { history: 'This line of work becomes the Foreign Function and Memory API, which is final in Java 22 (JEP 454).' }),
      jep(343, 'Packaging Tool (Incubator)', T, 'Incubator', 'jpackage is an incubator tool for packaging a Java application. It is not final.', { history: 'Final in Java 16 (JEP 392).' }),
      jep(363, 'Remove the Concurrent Mark Sweep (CMS) Garbage Collector', R, 'Final', 'CMS is removed. G1 remains the default collector from Java 9.', { lesson: jvm }),
    ],
    historical: 'The cumulative example uses the final switch-expression syntax from this release together with later records, text blocks, and sealed classes. It is a Java 17 file.',
    examples: [v5],
  }),
  release(15, {
    ga: '15 September 2020',
    spec: 'JSR 390',
    description: 'JDK 15, JSR 390, reached general availability on 15 September 2020. Text blocks become standard. Sealed classes are a preview.',
    overview: 'JDK 15 is Java SE 15, JSR 390, generally available on 15 September 2020. Text blocks become permanent. Sealed classes are a preview, and records and instanceof patterns are in a second preview. ZGC and Shenandoah leave experimental status.',
    sources: 'General availability and the JEP list: OpenJDK JDK 15. JSR 390: Oracle Java SE specifications.',
    features: [
      jep(378, 'Text Blocks', L, 'Final', 'Text blocks are a permanent multi-line string literal.', { history: 'Preview in Java 13 (JEP 355) and Java 14 (JEP 368).', lesson: strings, example: link(v5) }),
      jep(360, 'Sealed Classes (Preview)', L, 'Preview', 'A sealed type lists the classes and interfaces that may extend or implement it. In Java 15 this is a preview.', { history: 'Second preview in Java 16 (JEP 397). Final in Java 17 (JEP 409).', lesson: records }),
      jep(384, 'Records (Second Preview)', L, 'Preview', 'Records are previewed again. They are not yet a permanent class form.', { history: 'First preview in Java 14 (JEP 359). Final in Java 16 (JEP 395).', lesson: records }),
      jep(375, 'Pattern Matching for instanceof (Second Preview)', L, 'Preview', 'instanceof patterns are previewed again, without becoming final.', { history: 'First preview in Java 14 (JEP 305). Final in Java 16 (JEP 394).' }),
      jep(377, 'ZGC: A Scalable Low-Latency Garbage Collector', R, 'Final', 'ZGC becomes a product feature. It is not the default collector.', { history: 'Experimental in Java 11 (JEP 333).', lesson: jvm }),
      jep(379, 'Shenandoah: A Low-Pause-Time Garbage Collector', R, 'Final', 'Shenandoah becomes a product feature. It is not the default collector.', { history: 'Experimental in Java 12 (JEP 189).', lesson: jvm }),
      jep(372, 'Remove the Nashorn JavaScript Engine', T, 'Final', 'Nashorn is removed.', { history: 'It shipped in Java 8 and was deprecated in Java 11 (JEP 335).' }),
      jep(339, 'Edwards-Curve Digital Signature Algorithm (EdDSA)', A, 'Final', 'The JDK implements EdDSA signatures, a cryptographic API addition.'),
    ],
    historical: 'Hidden classes (JEP 371) also ship. They are a JVM feature for frameworks that generate classes, not a new source construct for typical programs.',
    examples: [v5],
  }),
  release(16, {
    ga: '16 March 2021',
    spec: 'JSR 391',
    description: 'JDK 16, JSR 391, reached general availability on 16 March 2021. Records and instanceof patterns become standard. Sealed classes stay in preview.',
    overview: 'JDK 16 is Java SE 16, JSR 391, generally available on 16 March 2021. Records and pattern matching for instanceof become permanent. Sealed classes are still a preview. jpackage leaves the incubator. Stream.toList() arrives in this release.',
    sources: 'General availability and the JEP list: OpenJDK JDK 16. JSR 391: Oracle Java SE specifications.',
    features: [
      jep(395, 'Records', L, 'Final', 'A record declares a final carrier with a canonical constructor, accessors, and value-based equals, hashCode, and toString.', { history: 'Preview in Java 14 (JEP 359) and Java 15 (JEP 384).', lesson: records, example: link(v5) }),
      jep(394, 'Pattern Matching for instanceof', L, 'Final', 'instanceof can test a type and bind a pattern variable in the same expression.', { history: 'Preview in Java 14 (JEP 305) and Java 15 (JEP 375).', example: link(v5) }),
      jep(397, 'Sealed Classes (Second Preview)', L, 'Preview', 'Sealed classes are previewed again. They are not final.', { history: 'First preview in Java 15 (JEP 360). Final in Java 17 (JEP 409).', lesson: records }),
      feature('java16-tolist', 'Stream.toList()', A, 'Final', 'Stream gains toList(), which returns an unmodifiable list. The Java 9–11 example does not call it. It keeps Collectors.toList() so that file can stay a Java 11 program.', { lesson: streams }),
      jep(392, 'Packaging Tool', T, 'Final', 'jpackage is a supported tool for producing platform packages.', { history: 'Incubated in Java 14 (JEP 343).' }),
      jep(396, 'Strongly Encapsulate JDK Internals by Default', R, 'Final', 'JDK-internal APIs are strongly encapsulated by default. The choice can still be relaxed. Java 17 removes that relaxation for most internals.', { lesson: jvm }),
      jep(338, 'Vector API (Incubator)', A, 'Incubator', 'An incubator API for vector computations. It is not a standard API.', { history: 'It is still incubating in Java 25, as the tenth incubator (JEP 508).' }),
      jep(380, 'Unix-Domain Socket Channels', A, 'Final', 'SocketChannel and ServerSocketChannel can use Unix-domain sockets.'),
    ],
    historical: 'The cumulative example’s records and instanceof patterns match this release. Its sealed classes match the Java 17 final form, so the file is not a Java 16 program.',
    examples: [v5],
  }),
  release(17, {
    ga: '14 September 2021',
    spec: 'JSR 392',
    lts: true,
    description: 'JDK 17, JSR 392, reached general availability on 14 September 2021. Sealed classes become standard. Pattern matching for switch is a preview.',
    overview: 'JDK 17 is Java SE 17, JSR 392, generally available on 14 September 2021. Vendors treat it as a long-term support release. Sealed classes become permanent. Pattern matching for switch is only a preview. The JDK strongly encapsulates its internals.',
    sources: 'General availability and the JEP list: OpenJDK JDK 17. JSR 392: Oracle Java SE specifications.',
    features: [
      jep(409, 'Sealed Classes', L, 'Final', 'A sealed type permits a fixed set of subtypes, which a switch can cover exhaustively once pattern matching for switch is available.', { history: 'Preview in Java 15 (JEP 360) and Java 16 (JEP 397).', lesson: records, example: link(v5) }),
      jep(406, 'Pattern Matching for switch (Preview)', L, 'Preview', 'A switch can test patterns, including types. In Java 17 this is a preview, not the final feature.', { history: 'Further previews in Java 18, 19, and 20. Final in Java 21 (JEP 441).', lesson: control }),
      jep(403, 'Strongly Encapsulate JDK Internals', R, 'Final', 'The JDK no longer offers the Java 16 relaxation that opened internal APIs. Most internal elements stay inaccessible.', { history: 'Java 16 encapsulated internals by default but still allowed a flag to relax it (JEP 396).', lesson: jvm }),
      jep(356, 'Enhanced Pseudo-Random Number Generators', A, 'Final', 'A common RandomGenerator API covers the JDK’s pseudorandom algorithms, including splittable generators.'),
      jep(306, 'Restore Always-Strict Floating-Point Semantics', R, 'Final', 'Floating-point expressions are consistently strict. The old default that allowed extended precision is gone.'),
      jep(411, 'Deprecate the Security Manager for Removal', A, 'Final', 'The Security Manager is deprecated and marked for removal. It is still present.', { history: 'Java 24 permanently disables it (JEP 486).' }),
      jep(398, 'Deprecate the Applet API for Removal', A, 'Final', 'The Applet API is deprecated for removal.'),
      jep(412, 'Foreign Function & Memory API (Incubator)', A, 'Incubator', 'The foreign function and memory API incubates. It is not a preview or a standard API yet.', { history: 'Preview in Java 19 through Java 21. Final in Java 22 (JEP 454).' }),
      jep(414, 'Vector API (Second Incubator)', A, 'Incubator', 'The Vector API incubates again. It is still not a standard API.', { history: 'First incubator in Java 16 (JEP 338). Still incubating in Java 25.' }),
    ],
    also: 'Also in this release: context-specific deserialization filters (JEP 415), removal of RMI Activation (JEP 407), and a macOS/AArch64 port (JEP 391).',
    historical: 'Since Java 11, switch expressions became final in Java 14, text blocks in Java 15, and records and instanceof patterns in Java 16. Sealed classes become final here. Pattern matching for switch is still a preview, so the Java 17 example does not use it.',
    examples: [v5],
  }),
  release(18, {
    ga: '22 March 2022',
    spec: 'JSR 393',
    description: 'JDK 18, JSR 393, reached general availability on 22 March 2022. UTF-8 becomes the default charset. Pattern matching for switch is a second preview.',
    overview: 'JDK 18 is Java SE 18, JSR 393, generally available on 22 March 2022. The charset default becomes UTF-8. The JDK includes a simple web server. Pattern matching for switch is a second preview. Finalization is deprecated for removal.',
    sources: 'General availability, JSR 393, and the JEP list: OpenJDK JDK 18.',
    features: [
      jep(400, 'UTF-8 by Default', R, 'Final', 'Charset.defaultCharset() is UTF-8 unless the user overrides it. Programs that assumed the operating system’s charset can change behavior.', { lesson: strings }),
      jep(408, 'Simple Web Server', T, 'Final', 'jwebserver serves static files from a directory. It is a tool for development and testing, not a production server.', { lesson: networking }),
      jep(413, 'Code Snippets in Java API Documentation', T, 'Final', 'Javadoc can include code snippets from source files, so an example can be compiled rather than copied into a comment.'),
      jep(420, 'Pattern Matching for switch (Second Preview)', L, 'Preview', 'Pattern matching for switch is previewed again. It is not final.', { history: 'First preview in Java 17 (JEP 406). Final in Java 21 (JEP 441).', lesson: control }),
      jep(421, 'Deprecate Finalization for Removal', R, 'Final', 'Finalizers are deprecated for removal. The deprecation is the change in this release. Finalizers still run.'),
      jep(419, 'Foreign Function & Memory API (Second Incubator)', A, 'Incubator', 'The foreign function and memory API incubates a second time.', { history: 'First incubator in Java 17 (JEP 412). Preview in Java 19 (JEP 424).' }),
      jep(417, 'Vector API (Third Incubator)', A, 'Incubator', 'The Vector API incubates a third time.', { history: 'Still incubating in Java 25 (JEP 508).' }),
    ],
    historical: 'Java 18 does not finalize virtual threads, record patterns, or structured concurrency. Those are not in this release. There is no Java 18 sample. UTF-8 by default is a change of default, not a new API, and jwebserver is a command-line tool rather than a small library program.',
    examples: [],
  }),
  release(19, {
    ga: '20 September 2022',
    spec: 'JSR 394',
    description: 'JDK 19, JSR 394, reached general availability on 20 September 2022. Virtual threads and record patterns are previews. Structured concurrency is an incubator.',
    overview: 'JDK 19 is Java SE 19, JSR 394, generally available on 20 September 2022. Virtual threads, record patterns, and the foreign function and memory API are previews. Structured concurrency is an incubator API, not a preview and not a final API.',
    sources: 'General availability, JSR 394, and the JEP list: OpenJDK JDK 19.',
    features: [
      jep(425, 'Virtual Threads (Preview)', L, 'Preview', 'Virtual threads are lightweight threads for blocking work. In Java 19 they are a preview.', { history: 'Second preview in Java 20 (JEP 436). Final in Java 21 (JEP 444).', lesson: concurrency }),
      jep(405, 'Record Patterns (Preview)', L, 'Preview', 'A record pattern takes a record apart into its components. This is a preview.', { history: 'Second preview in Java 20 (JEP 432). Final in Java 21 (JEP 440).', lesson: records }),
      jep(427, 'Pattern Matching for switch (Third Preview)', L, 'Preview', 'Pattern matching for switch is previewed a third time.', { history: 'Final in Java 21 (JEP 441).', lesson: control }),
      jep(428, 'Structured Concurrency (Incubator)', A, 'Incubator', 'An incubator API treats related tasks as one unit of work. It is not a preview feature and not a standard API.', { history: 'Second incubator in Java 20 (JEP 437). Preview from Java 21 (JEP 453) through Java 25 (JEP 505). It is not final in Java 25.', lesson: concurrency }),
      jep(424, 'Foreign Function & Memory API (Preview)', A, 'Preview', 'The foreign function and memory API leaves incubation and becomes a preview.', { history: 'Final in Java 22 (JEP 454).' }),
      jep(426, 'Vector API (Fourth Incubator)', A, 'Incubator', 'The Vector API incubates a fourth time.', { history: 'Still incubating in Java 25.' }),
    ],
    also: 'Also in this release: a Linux/RISC-V port (JEP 422).',
    historical: 'The linked file is a Java 21 program. Virtual threads, record patterns, and switch patterns were previews in Java 19. Structured concurrency was an incubator in Java 19, and that file does not demonstrate it.',
    examples: [v6modern],
  }),
  release(20, {
    ga: '21 March 2023',
    spec: 'JSR 395',
    description: 'JDK 20, JSR 395, reached general availability on 21 March 2023. Scoped values incubate. Virtual threads are a second preview.',
    overview: 'JDK 20 is Java SE 20, JSR 395, generally available on 21 March 2023. Scoped values appear for the first time, as an incubator API. Virtual threads, record patterns, switch patterns, and the foreign function and memory API are further previews. Structured concurrency is a second incubator.',
    sources: 'General availability, JSR 395, and the JEP list: OpenJDK JDK 20.',
    features: [
      jep(429, 'Scoped Values (Incubator)', A, 'Incubator', 'An incubator API shares immutable data with a call and with child threads. It is not a preview and not a standard API.', { history: 'Preview in Java 21 through Java 24. Final in Java 25 (JEP 506).', lesson: concurrency }),
      jep(436, 'Virtual Threads (Second Preview)', L, 'Preview', 'Virtual threads are previewed again, with a small set of changes from the first preview.', { history: 'First preview in Java 19 (JEP 425). Final in Java 21 (JEP 444).', lesson: concurrency }),
      jep(432, 'Record Patterns (Second Preview)', L, 'Preview', 'Record patterns are previewed again.', { history: 'Final in Java 21 (JEP 440).', lesson: records }),
      jep(433, 'Pattern Matching for switch (Fourth Preview)', L, 'Preview', 'Pattern matching for switch is previewed a fourth time.', { history: 'Final in Java 21 (JEP 441).', lesson: control }),
      jep(437, 'Structured Concurrency (Second Incubator)', A, 'Incubator', 'Structured concurrency incubates a second time. It is still not a preview.', { history: 'First incubator in Java 19 (JEP 428). First preview in Java 21 (JEP 453).', lesson: concurrency }),
      jep(434, 'Foreign Function & Memory API (Second Preview)', A, 'Preview', 'The foreign function and memory API is previewed a second time.', { history: 'Final in Java 22 (JEP 454).' }),
      jep(438, 'Vector API (Fifth Incubator)', A, 'Incubator', 'The Vector API incubates a fifth time.', { history: 'Still incubating in Java 25.' }),
    ],
    historical: 'Scoped values are an incubator API in this release. There is no Java 20 sample. The incubator type lived in a module that JDK 25 does not ship, so the final Java 25 example is not a Java 20 program.',
    examples: [],
  }),
  release(21, {
    ga: '19 September 2023',
    spec: 'JSR 396',
    lts: true,
    description: 'JDK 21, JSR 396, reached general availability on 19 September 2023. Virtual threads, record patterns, switch patterns, and sequenced collections are final. Several other features stay in preview.',
    overview: 'JDK 21 is Java SE 21, JSR 396, generally available on 19 September 2023. Vendors treat it as a long-term support release. Virtual threads, pattern matching for switch, record patterns, and sequenced collections are final. String templates, scoped values, structured concurrency, unnamed patterns, and unnamed classes are previews. The existing Java 21 example and the concurrency chapter stay the detailed sources.',
    sources: 'General availability, JSR 396, and the JEP list: OpenJDK JDK 21. The example file versions6Java21Features.java is unchanged.',
    features: [
      jep(444, 'Virtual Threads', L, 'Final', 'A virtual thread is a lightweight thread for blocking I/O. The JVM schedules many of them onto a smaller set of platform threads.', { history: 'Preview in Java 19 (JEP 425) and Java 20 (JEP 436).', lesson: concurrency, example: link(v6) }),
      jep(441, 'Pattern Matching for switch', L, 'Final', 'A switch can match type patterns, record patterns, and null, and a guarded pattern can use when.', { history: 'Preview in Java 17 through Java 20.', lesson: control, example: link(v6) }),
      jep(440, 'Record Patterns', L, 'Final', 'A pattern can deconstruct a record in switch or instanceof.', { history: 'Preview in Java 19 (JEP 405) and Java 20 (JEP 432).', lesson: records, example: link(v6) }),
      jep(431, 'Sequenced Collections', A, 'Final', 'SequencedCollection, SequencedSet, and SequencedMap add getFirst, getLast, and reversed to ordered collections.', { lesson: collections, example: link(v6) }),
      jep(439, 'Generational ZGC', R, 'Final', 'ZGC can keep young and old objects in separate generations. This is a collector change, not a source change.', { lesson: jvm }),
      jep(452, 'Key Encapsulation Mechanism API', A, 'Final', 'javax.crypto adds an API for key encapsulation mechanisms.'),
      jep(430, 'String Templates (Preview)', L, 'Preview', 'String templates are a preview for interpolating values into a string or another result. They are not a permanent feature.', { history: 'Second preview in Java 22 (JEP 459). They are not in the JDK 23, JDK 24, or JDK 25 feature lists.' }),
      jep(443, 'Unnamed Patterns and Variables (Preview)', L, 'Preview', 'An underscore can stand for a variable or a pattern component that the program does not use. This is a preview.', { history: 'Final in Java 22 (JEP 456).' }),
      jep(445, 'Unnamed Classes and Instance Main Methods (Preview)', L, 'Preview', 'A small program can omit the class wrapper and use an instance main method. This is a preview.', { history: 'The idea continues through later previews and is finalized in Java 25 as compact source files (JEP 512).' }),
      jep(446, 'Scoped Values (Preview)', A, 'Preview', 'Scoped values are a preview API for sharing immutable data down a call, including across virtual threads.', { history: 'Incubated in Java 20 (JEP 429). Final in Java 25 (JEP 506).', lesson: concurrency }),
      jep(453, 'Structured Concurrency (Preview)', A, 'Preview', 'Structured concurrency is a preview API. Related tasks form one unit of work that can cancel and report errors together.', { history: 'Incubated in Java 19 and Java 20. Still a preview in Java 25 (JEP 505).', lesson: concurrency, example: link(structured) }),
      jep(442, 'Foreign Function & Memory API (Third Preview)', A, 'Preview', 'The foreign function and memory API is previewed a third time. It is not final in Java 21.', { history: 'Final in Java 22 (JEP 454).' }),
      jep(448, 'Vector API (Sixth Incubator)', A, 'Incubator', 'The Vector API incubates a sixth time.', { history: 'Still incubating in Java 25 (JEP 508).' }),
    ],
    also: 'Also in this release: deprecation of the Windows 32-bit x86 port (JEP 449) and preparation to disallow dynamic agent loading (JEP 451).',
    historical: 'Since Java 17, this release finalizes virtual threads, switch patterns, and record patterns, and it adds sequenced collections. Structured concurrency, scoped values, string templates, unnamed variables, and unnamed classes remain previews. The Java 21 source file is unchanged and does not demonstrate the preview APIs.',
    examples: [v6, virtualThreads, structured],
  }),
  release(22, {
    ga: '19 March 2024',
    spec: 'JSR 397',
    description: 'JDK 22, JSR 397, reached general availability on 19 March 2024. Unnamed variables and the foreign function and memory API become final. Stream gatherers are a preview.',
    overview: 'JDK 22 is Java SE 22, JSR 397, generally available on 19 March 2024. Unnamed variables and the foreign function and memory API become permanent. Stream gatherers, the class-file API, statements before super(...), and string templates are previews. Structured concurrency and scoped values are still previews.',
    sources: 'General availability, JSR 397, and the JEP list: OpenJDK JDK 22.',
    features: [
      jep(456, 'Unnamed Variables & Patterns', L, 'Final', 'An underscore marks a variable or pattern component the program does not read.', { history: 'Preview in Java 21 (JEP 443).', example: link(v7) }),
      jep(454, 'Foreign Function & Memory API', A, 'Final', 'Java programs can call native code and use off-heap memory through a standard API, without JNI for the common cases.', { history: 'Incubated in Java 17 and Java 18. Preview in Java 19, Java 20, and Java 21.' }),
      jep(461, 'Stream Gatherers (Preview)', A, 'Preview', 'A gatherer is a preview intermediate stream operation that can do more than the built-in operations.', { history: 'Second preview in Java 23 (JEP 473). Final in Java 24 (JEP 485).', lesson: streams }),
      jep(457, 'Class-File API (Preview)', A, 'Preview', 'A preview API parses, generates, and transforms class files. It is not final.', { history: 'Final in Java 24 (JEP 484).' }),
      jep(447, 'Statements before super(...) (Preview)', L, 'Preview', 'A constructor may run statements before super(...) or this(...). Those statements cannot use the object under construction. This is a preview.', { history: 'Final in Java 25 as flexible constructor bodies (JEP 513).' }),
      jep(463, 'Implicitly Declared Classes and Instance Main Methods (Second Preview)', L, 'Preview', 'The compact-program preview continues. A source file can still omit the usual class declaration.', { history: 'First preview in Java 21 (JEP 445). Final in Java 25 (JEP 512).' }),
      jep(459, 'String Templates (Second Preview)', L, 'Preview', 'String templates are previewed a second time. They are not finalized in this release.', { history: 'First preview in Java 21 (JEP 430). They do not appear in the JDK 23, JDK 24, or JDK 25 feature lists.' }),
      jep(462, 'Structured Concurrency (Second Preview)', A, 'Preview', 'Structured concurrency is previewed a second time.', { history: 'Still a preview in Java 25 (JEP 505).', lesson: concurrency }),
      jep(464, 'Scoped Values (Second Preview)', A, 'Preview', 'Scoped values are previewed a second time.', { history: 'Final in Java 25 (JEP 506).', lesson: concurrency }),
      jep(458, 'Launch Multi-File Source-Code Programs', T, 'Final', 'The java launcher can run a program that is split across more than one source file, without a separate compile step.'),
      jep(423, 'Region Pinning for G1', R, 'Final', 'G1 can pin individual regions during native calls instead of disabling garbage collection for the whole heap.', { lesson: jvm }),
      jep(460, 'Vector API (Seventh Incubator)', A, 'Incubator', 'The Vector API incubates a seventh time.', { history: 'Still incubating in Java 25.' }),
    ],
    historical: 'String templates are still a preview. Nothing in Java 23, 24, or 25 turns them into a final feature.',
    examples: [v7],
  }),
  release(23, {
    ga: '17 September 2024',
    spec: 'JSR 398',
    description: 'JDK 23, JSR 398, reached general availability on 17 September 2024. Primitive patterns and module imports are previews. ZGC’s generational mode becomes the default.',
    overview: 'JDK 23 is Java SE 23, JSR 398, generally available on 17 September 2024. Markdown documentation comments become standard. Primitive patterns, module import declarations, and flexible constructor bodies are previews. ZGC uses the generational mode by default. Stream gatherers and the class-file API are still previews.',
    sources: 'General availability, JSR 398, and the JEP list: OpenJDK JDK 23.',
    features: [
      jep(467, 'Markdown Documentation Comments', T, 'Final', 'Documentation comments can be written in Markdown as well as in the traditional comment syntax.'),
      jep(455, 'Primitive Types in Patterns, instanceof, and switch (Preview)', L, 'Preview', 'Patterns, instanceof, and switch can mention primitive types. This is a preview.', { history: 'Second preview in Java 24 (JEP 488). Third preview in Java 25 (JEP 507). It is not final in Java 25.' }),
      jep(476, 'Module Import Declarations (Preview)', L, 'Preview', 'import module M is a preview. It imports the public types of the packages a module exports.', { history: 'Final in Java 25 (JEP 511).' }),
      jep(482, 'Flexible Constructor Bodies (Second Preview)', L, 'Preview', 'Statements before super(...) are previewed again.', { history: 'First preview in Java 22 (JEP 447). Final in Java 25 (JEP 513).' }),
      jep(473, 'Stream Gatherers (Second Preview)', A, 'Preview', 'Stream gatherers are previewed a second time.', { history: 'Final in Java 24 (JEP 485).', lesson: streams }),
      jep(466, 'Class-File API (Second Preview)', A, 'Preview', 'The class-file API is previewed a second time.', { history: 'Final in Java 24 (JEP 484).' }),
      jep(477, 'Implicitly Declared Classes and Instance Main Methods (Third Preview)', L, 'Preview', 'The compact-program preview continues.', { history: 'Final in Java 25 as compact source files (JEP 512).' }),
      jep(480, 'Structured Concurrency (Third Preview)', A, 'Preview', 'Structured concurrency is previewed a third time.', { history: 'Still a preview in Java 25.', lesson: concurrency }),
      jep(481, 'Scoped Values (Third Preview)', A, 'Preview', 'Scoped values are previewed a third time.', { history: 'Final in Java 25 (JEP 506).', lesson: concurrency }),
      jep(474, 'ZGC: Generational Mode by Default', R, 'Final', 'ZGC’s default mode is generational. Non-generational ZGC is still available in this release.', { history: 'Generational ZGC arrived in Java 21 (JEP 439). Java 24 removes the non-generational mode (JEP 490).', lesson: jvm }),
      jep(471, 'Deprecate the Memory-Access Methods in sun.misc.Unsafe for Removal', A, 'Final', 'The memory-access methods of sun.misc.Unsafe are deprecated for removal. They are not removed in this release.'),
      jep(469, 'Vector API (Eighth Incubator)', A, 'Incubator', 'The Vector API incubates an eighth time.', { history: 'Still incubating in Java 25.' }),
    ],
    historical: 'String templates are not in this release. Their last preview in this curriculum is Java 22. There is no Java 23 sample. The language changes here were previews. Later final forms are the Java 24 gatherers example and the Java 25 module-import and constructor examples.',
    examples: [],
  }),
  release(24, {
    ga: '18 March 2025',
    spec: 'JSR 399',
    description: 'JDK 24, JSR 399, reached general availability on 18 March 2025. Stream gatherers and the class-file API become final. Generational Shenandoah is experimental.',
    overview: 'JDK 24 is Java SE 24, JSR 399, generally available on 18 March 2025. Stream gatherers and the class-file API become permanent. The Security Manager is permanently disabled. Scoped values, structured concurrency, primitive patterns, module imports, and flexible constructor bodies are still previews. Generational Shenandoah and compact object headers are experimental.',
    sources: 'General availability, JSR 399, and the JEP list: OpenJDK JDK 24.',
    features: [
      jep(485, 'Stream Gatherers', A, 'Final', 'Gatherers are a permanent intermediate stream operation. Gatherers.windowFixed is one of the built-in gatherers.', { history: 'Preview in Java 22 (JEP 461) and Java 23 (JEP 473).', lesson: streams, example: link(v8) }),
      jep(484, 'Class-File API', A, 'Final', 'The class-file API is a standard way to parse, generate, and transform class files.', { history: 'Preview in Java 22 (JEP 457) and Java 23 (JEP 466).' }),
      jep(486, 'Permanently Disable the Security Manager', A, 'Final', 'The Security Manager cannot be enabled. The API remains deprecated for removal.', { history: 'Deprecated for removal in Java 17 (JEP 411).' }),
      jep(491, 'Synchronize Virtual Threads without Pinning', R, 'Final', 'A virtual thread that enters a synchronized method or block can unmount from its carrier. This removes a reason virtual threads stayed pinned.', { history: 'Virtual threads themselves were finalized in Java 21 (JEP 444).', lesson: concurrency }),
      jep(490, 'ZGC: Remove the Non-Generational Mode', R, 'Final', 'ZGC’s non-generational mode is removed. Generational ZGC remains.', { history: 'Generational mode became the default in Java 23 (JEP 474).', lesson: jvm }),
      jep(483, 'Ahead-of-Time Class Loading & Linking', R, 'Final', 'An application can load and link classes from a cache created in a training run, so startup does less of that work.', { history: 'Java 25 simplifies the command line for creating that cache (JEP 514).' }),
      jep(404, 'Generational Shenandoah (Experimental)', R, 'Experimental', 'Shenandoah’s generational mode is experimental. The default Shenandoah mode stays single-generation.', { history: 'It becomes a product feature in Java 25 (JEP 521) and is still not the default mode.', lesson: jvm }),
      jep(450, 'Compact Object Headers (Experimental)', R, 'Experimental', 'Compact object headers are an experimental layout. They are not the default.', { history: 'They become a product feature in Java 25 (JEP 519) and are still not the default layout.' }),
      jep(496, 'Quantum-Resistant Module-Lattice-Based Key Encapsulation Mechanism', A, 'Final', 'The JDK implements ML-KEM, a module-lattice key encapsulation mechanism.'),
      jep(497, 'Quantum-Resistant Module-Lattice-Based Digital Signature Algorithm', A, 'Final', 'The JDK implements ML-DSA, a module-lattice signature algorithm.'),
      jep(478, 'Key Derivation Function API (Preview)', A, 'Preview', 'A preview API derives keys from key material. It is not final.', { history: 'Final in Java 25 (JEP 510).' }),
      jep(487, 'Scoped Values (Fourth Preview)', A, 'Preview', 'Scoped values are previewed a fourth time.', { history: 'Final in Java 25 (JEP 506).', lesson: concurrency }),
      jep(499, 'Structured Concurrency (Fourth Preview)', A, 'Preview', 'Structured concurrency is previewed a fourth time.', { history: 'Fifth preview in Java 25 (JEP 505). It is not final.', lesson: concurrency }),
      jep(488, 'Primitive Types in Patterns, instanceof, and switch (Second Preview)', L, 'Preview', 'Primitive patterns are previewed a second time.', { history: 'Third preview in Java 25 (JEP 507). Not final.' }),
      jep(492, 'Flexible Constructor Bodies (Third Preview)', L, 'Preview', 'Statements before super(...) are previewed a third time.', { history: 'Final in Java 25 (JEP 513).' }),
      jep(494, 'Module Import Declarations (Second Preview)', L, 'Preview', 'import module is previewed a second time.', { history: 'Final in Java 25 (JEP 511).' }),
      jep(495, 'Simple Source Files and Instance Main Methods (Fourth Preview)', L, 'Preview', 'The compact-program preview continues under the name simple source files.', { history: 'Final in Java 25 as compact source files (JEP 512).' }),
      jep(489, 'Vector API (Ninth Incubator)', A, 'Incubator', 'The Vector API incubates a ninth time.', { history: 'Tenth incubator in Java 25 (JEP 508).' }),
    ],
    also: 'Also in this release: removal of the Windows 32-bit x86 port (JEP 479), warnings on Unsafe memory access (JEP 498), and deprecation of the 32-bit x86 port for removal (JEP 501).',
    historical: 'Features that are still previews here stay previews on this page even when Java 25 finalizes them. Generational Shenandoah is experimental in this release, not a product feature yet.',
    examples: [v8],
  }),
]

const java25Category = {
  Language: L,
  Libraries: A,
  Security: A,
  JVM: R,
}

const java25Examples = {
  506: link(v9),
  513: link(v10),
  511: link(v11),
}

const java25 = release(25, {
  url: JAVA25_PAGE,
  ga: '16 September 2025',
  spec: 'JSR 400',
  lts: true,
  description: 'JDK 25, JSR 400, reached general availability on 16 September 2025. Final, preview, incubator, and experimental JEPs stay in those statuses, including JEP 509 as experimental.',
  overview: 'JDK 25 is the reference implementation of Java SE 25, JSR 400. It reached general availability on 16 September 2025. Most vendors treat it as a long-term support release. The 18 JEPs below are the JDK 25 feature set from the OpenJDK project page. Titles and status come from those JEP pages. Java 21 stays in this curriculum.',
  sources: 'Feature list and status: OpenJDK JDK 25 and the individual JEP pages. JSR 400 and the release month: Oracle Java SE specifications.',
  projectUrl: 'https://openjdk.org/projects/jdk/25/',
  features: JAVA25_FEATURES.map((item) => feature(
    `jep-${item.jep}`,
    item.title,
    java25Category[item.category],
    item.status,
    item.summary,
    {
      jep: item.jep,
      history: item.history,
      lesson: item.lesson ?? null,
      example: java25Examples[item.jep] ?? item.example ?? null,
    },
  )),
  historical: 'Since Java 21, scoped values, stream gatherers, the class-file API, the foreign function and memory API, flexible constructor bodies, module imports, and compact source files have become final, some of them in Java 22 or Java 24 rather than in Java 25. Structured concurrency is still a preview. The Vector API is still an incubator. JEP 509 is experimental. It is not final merely because it shipped in JDK 25.',
  examples: [v9, v10, v11, structured],
})

const versions = [...earlier, java25]
for (let index = 0; index < versions.length; index += 1) {
  versions[index].previous = index === 0 ? null : { title: `Java ${versions[index - 1].version}`, href: versions[index - 1].url }
  versions[index].next = index === versions.length - 1 ? null : { title: `Java ${versions[index + 1].version}`, href: versions[index + 1].url }
}

function assertCurriculum(rows) {
  const expected = Array.from({ length: 20 }, (_, index) => index + 6)
  if (rows.map((row) => row.version).join() !== expected.join()) throw new Error('Java versions are not 6 through 25 in order')
  const ids = new Set()
  const jeps = new Set()
  const statuses = new Set(['Final', 'Preview', 'Incubator', 'Experimental'])
  const categories = new Set([L, A, R, T])
  for (const row of rows) {
    if (row.url !== `/versions/java-${row.version}`) throw new Error(`Bad URL for Java ${row.version}`)
    if (!row.features.length) throw new Error(`Java ${row.version} has no features`)
    for (const item of row.features) {
      if (ids.has(item.id)) throw new Error(`Duplicate feature id ${item.id}`)
      ids.add(item.id)
      if (!statuses.has(item.status)) throw new Error(`Bad status on ${item.id}`)
      if (!categories.has(item.category)) throw new Error(`Bad category on ${item.id}`)
      if (item.status === 'Final' && /(Preview|Incubator|Experimental)/.test(item.name)) throw new Error(`${item.id} is marked Final`)
      if (item.jep != null) {
        if (jeps.has(item.jep)) throw new Error(`Duplicate JEP ${item.jep}`)
        jeps.add(item.jep)
        if (item.jepUrl !== `https://openjdk.org/jeps/${item.jep}`) throw new Error(`Bad JEP URL ${item.jep}`)
      }
    }
  }
  const featureAt = (version, number) => rows.find((row) => row.version === version).features.find((item) => item.jep === number)
  const must = (version, number, status) => {
    const item = featureAt(version, number)
    if (!item || item.status !== status) throw new Error(`JEP ${number} in Java ${version} should be ${status}`)
  }
  must(12, 325, 'Preview')
  must(14, 361, 'Final')
  must(13, 355, 'Preview')
  must(15, 378, 'Final')
  must(14, 359, 'Preview')
  must(16, 395, 'Final')
  must(16, 394, 'Final')
  must(17, 409, 'Final')
  must(17, 406, 'Preview')
  must(21, 441, 'Final')
  must(19, 425, 'Preview')
  must(21, 444, 'Final')
  must(19, 428, 'Incubator')
  must(20, 437, 'Incubator')
  must(21, 453, 'Preview')
  must(22, 462, 'Preview')
  must(23, 480, 'Preview')
  must(24, 499, 'Preview')
  must(25, 505, 'Preview')
  must(20, 429, 'Incubator')
  must(21, 446, 'Preview')
  must(25, 506, 'Final')
  must(21, 430, 'Preview')
  must(22, 459, 'Preview')
  must(22, 456, 'Final')
  must(24, 485, 'Final')
  must(25, 509, 'Experimental')
  must(25, 508, 'Incubator')
  for (const version of [23, 24, 25]) {
    if (rows.find((row) => row.version === version).features.some((item) => /string templates/i.test(item.name))) {
      throw new Error(`String templates are listed as a Java ${version} feature`)
    }
  }
  if (rows.find((row) => row.version === 25).features.length !== 18) throw new Error('Java 25 feature count')
  for (const row of rows) {
    for (const example of row.examples) {
      if (!example.exampleType || typeof example.requiredJava !== 'number') throw new Error(`Example metadata missing on Java ${row.version}`)
    }
  }
  const java19 = rows.find((row) => row.version === 19)
  if (java19.examples.some((example) => example.requiredJava !== 21 || example.exampleType === 'Java 19 example')) {
    throw new Error('Java 19 must not present a Java 21 file as Java 19')
  }
}

assertCurriculum(versions)

export const JAVA_VERSIONS = versions
