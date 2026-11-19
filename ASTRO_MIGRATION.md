# Astro migration and Hostinger deployment notes

This file is a handoff for an agent maintaining the existing Astro site in `dicot-site/` and deploying it to the Hostinger domain root (usually `public_html`). The repository's CI/CD uploads pushed files to the server. Therefore, the deployable Astro build output must be placed at the repository/deployment root—not left only in `dicot-site/dist/`—while preserving required PHP endpoints, database-related files, downloads and hosting configuration. Do not scaffold a second Astro app or redo the migration. Inspect the repo, Astro project and actual CI/CD settings before changing or deleting anything.

## Current repository layout

```text
/
├── .htaccess
├── 485driver.exe
├── AutoExpo24.html
├── CareerPositions.json
├── Catalogue.pdf
├── TandC.html
├── about.html
├── careers.html
├── contact.html
├── downloads.html
├── formdata.php
├── home.html
├── licenseGenerator.html
├── package.json
├── package-lock.json
├── privacypolicy.html
├── products.html
├── randc.html
├── robots.txt
├── sitemap.xml
├── swiper-bundle.min.js
├── vGraphic.html
├── visionC.html
├── visionS.html
├── visionWeb.html
├── Assets/
│   ├── fonts/                 # Galano Grotesque OTF files
│   └── images/                # Logos, icons, product/client photos and other site images
├── CSS/                       # Page-specific stylesheets and Swiper CSS
├── DotNetFX461/
│   └── NDP461-KB3102436-x86-x64-AllOS-ENU.exe
├── VisitingCards/             # Nandan.html, style.css, image, vCard and logo
├── blog/
│   └── home.html
├── db/
│   └── db.php
├── dicot-site/                # Astro project (source, public assets, and its current dist/ output)
│   ├── astro.config.mjs
│   ├── package.json
│   ├── public/
│   │   ├── .htaccess
│   │   └── contact.php
│   ├── src/
│   └── dist/                  # Current build output; not yet at the repository root
└── node_modules/
    └── hover.css/
```

The workspace also contains `.gitignore`, `.vscode/`, and `.vs/`; these are development/IDE files, not website content. The root `package.json` declares only `hover.css`; the Astro project has its own `package.json` and Astro configuration. The repository has no checked-in `.github/workflows/` file, so verify how the configured CI/CD service builds and deploys before choosing where to stage the build. `node_modules/` is local installed tooling/dependency content, not a deployment artifact.

## Preserve and migrate deliberately

- **Static site content:** Migrate all current HTML pages, CSS, scripts, fonts, images, JSON data, PDFs and any other linked/downloaded files that the new site still uses. Keep filenames/paths or update every reference consistently. `careers.html` reads `CareerPositions.json`; pages use `swiper-bundle.min.js` and `CSS/swiper-bundle.min.css`.
- **Downloadable files:** `485driver.exe`, `DotNetFX461/NDP461-KB3102436-x86-x64-AllOS-ENU.exe`, and `Catalogue.pdf` are in this repository. Retain them in the deployed site if their download links are meant to keep working; they are content, not Astro dependencies. The download page also links to several files hosted at other URLs, which are not present here—do not assume those files are included in this build.
- **PHP and database:** `AutoExpo24.html` posts to `formdata.php`; `formdata.php` includes `db/db.php`. A static Astro build does not execute PHP. If this form remains, keep the PHP endpoint and its required server-side dependencies/configuration on a PHP-capable Hostinger plan, or intentionally replace it with a suitable backend and update/test the form. Preserve the production database and its data independently; this repository contains a PHP connection script, not a database dump/schema. No `.env`, Composer manifest, or Composer `vendor/` directory is present in the repository. Never put database credentials or `.env` files in the public web root. Before relying on the current PHP code, verify its Composer autoload path and database environment-variable mapping against the actual hosting configuration.
- **`.htaccess`:** Preserve a backup and merge/adapt the existing rules rather than blindly replacing or deleting this file. It currently sets `home.html` as the directory index, rewrites extensionless paths to `.html`, has `home.html` redirects that use HTTP, and serves `.vcf` as a vCard. Astro's output routes may differ, so configure the correct index, clean URLs, HTTPS/canonical redirects, old-URL redirects, and vCard MIME type for the final output. Test the final rules on Hostinger/Apache.
- **URLs and search indexing:** Existing internal links and `sitemap.xml` use `.html` URLs; the sitemap also lists `VisitingCards/Nandan.html` and `blog/home.html`. Decide which URLs Astro will emit, retain compatibility with redirects where URLs change, and update the sitemap and `robots.txt` as needed. Check canonical host and HTTPS behavior.
- **Standalone legacy pages:** `VisitingCards/` and `blog/home.html` are separate nested pages in the current repository. Preserve them or replace them with redirects only after confirming they are no longer needed.

## Astro integration and deployment workflow

1. Inspect `dicot-site/`'s `package.json`, lockfile, Astro config, routes, assets, and build scripts. Preserve the existing Astro implementation; do not scaffold or rewrite it unnecessarily.
2. Compare its routes, links, forms, assets and downloads with the legacy site documented above. Carry forward any required content or server-side behavior that the Astro site does not already include. Note external services (including Pageclip forms) and retain their behavior unless explicitly replacing them.
3. Configure the root route (`/`) to serve the intended home page. Check whether page URLs remain `.html` or become clean URLs; add redirects for old indexed URLs and update internal links, metadata, `sitemap.xml`, and `robots.txt` accordingly.
4. Install dependencies and build from `dicot-site/` using its existing package manager and scripts. Then ensure the **contents** of the generated build output are staged at the repository/deployment root before the CI/CD upload; the live site must not be served from a nested `dicot-site/` or `dist/` path. First determine whether CI/CD runs a build or simply deploys pushed files, and configure the appropriate build/publish step. Inspect the generated output and test every route and asset, downloads, mobile navigation, scripts, and each form. Specifically verify the PHP/database submission and any external forms; a successful static build does not validate server-side services.
5. Do not point Astro's output directly at the repository root or enable a clean of that root without verifying the tool's cleanup behavior: it could delete source, CI files, PHP endpoints, downloads, or `.htaccess`. Stage/copy only reviewed build output, retain required server-side files and data, and merge the Astro `public/.htaccess` rules into the deployed root `.htaccess` as needed.
6. Back up the current Hostinger document root and database before deployment. Verify HTTPS, root and legacy URLs, forms, downloads, sitemap/robots, and PHP behavior on the live domain. Keep a rollback copy until the new deployment is confirmed.

## Deployment exclusions

- Do **not** upload `node_modules/`, `.vs/`, `.vscode/`, npm caches, or Astro source-only files to `public_html`. Hostinger serves the built site; Node dependencies are needed to build, not to serve a static Astro site.
- Do **not** deploy the nested `dicot-site/dist/` path as the website root. Its contents must be staged at the repository/deployment root as part of the CI/CD process.
- Do **not** upload `.env` or database credentials to a public directory.
- Do **not** remove `.htaccess`, `db/`, `formdata.php`, or downloadable installers solely because they are not generated by Astro. First confirm whether the deployed site/backend/download links still require them.
