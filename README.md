# JavaForge-UI

Static site for **JavaMastery**. The content and Java source live in the sibling [JavaForge](../JavaForge) repository. This project copies them at build time and deploys as files. There is no backend, database, or runtime GitHub API.

## Scripts

```bash
npm install
npm run dev
npm run build
```

`npm run build` writes page JSON, typechecks, builds the client and server bundles, and prerenders HTML for every public route.

## Routes

These match the current public site:

| Path | Page |
|---|---|
| `/` | Home |
| `/learn` | Chapter order |
| `/docs/02-learn--01-GettingStarted` | A chapter. The same `section--file` pattern as today |
| `/examples` | Packages `pkg0` through `pkg21` |
| `/examples/pkg1core` | Files in study order |
| `/examples/pkg1core/core1HelloWorld` | Source, run command, linked chapter |
| `/projects` | Labs |
| `/bookmarks` | Browser-only. `noindex`, omitted from the sitemap |

Canonical URLs use `https://javamastery.srinivasrao.co.in` unless `VITE_SITE_URL` is set. Set that variable when the site is served from another host, so canonicals do not point at the wrong origin.

## Deploy

Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- If a sibling `../JavaForge` directory already contains `docs/`, the build uses it and does not clone anything.
- If that directory is missing, the build fetches `https://github.com/srinivasraoravinuthala/JavaForge.git` and checks out `JAVAFORGE_REF`. The default pin is `bddc5ccbd1dbef9aaa9b4b860aca916ac7c98774`. Override the pin with `JAVAFORGE_REF` (commit, tag, or branch). `JAVAFORGE_REPO` overrides the URL and must be https without credentials. The fetch happens only at build time. If JavaForge cannot be obtained, the build fails.

Known routes are real HTML files. Unknown routes use `404.html`. Bookmarks stay out of `robots.txt` and `sitemap.xml`.

## What this foundation does not do yet

Search, interview mode, a LeetCode browser, Java 25 lessons, and an in-browser runner are later phases. Source is shown as stored. Nothing rewrites a class to `Main`.
