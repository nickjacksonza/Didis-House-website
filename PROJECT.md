# Didi's House

**Stack:** Static HTML and CSS, no build step
**Live site:** https://recordingstudio.co.za/ (GitHub Pages, served through Cloudflare)
**Copy:** https://projects.slash301.com/DidisHouse/ (Xneelo, uploaded by GitHub Actions)

## What it is

The marketing website for Didi's House Recording Studio, a home recording studio in Randburg, Johannesburg.

## Where the site lives

All of the site is in `docs/`. GitHub Pages publishes that folder to recordingstudio.co.za (`docs/CNAME` sets the domain).

| File | Page |
|---|---|
| `docs/index.html` | Home page |
| `docs/contact.html` | Contact details and booking calendar |
| `docs/support-for-free.html` | Support page |
| `docs/privacy.html` | Privacy policy |
| `docs/sitemap.html` | Sitemap page |

There is no page in the repo root. To preview the site, open `docs/index.html` in a browser, or run `python3 -m http.server` from `docs/` so that links starting with `/` work.

## Deploying

- **recordingstudio.co.za:** GitHub Pages republishes `docs/` after each push to `main`.
- **projects.slash301.com/DidisHouse/:** `.github/workflows/deploy-xneelo.yml` uploads `docs/` by SFTP when `docs/` changes on `main`. Pull requests get a dry run only.
  - The workflow changes links that start with `/` to relative links in the uploaded copy, so they work inside the `/DidisHouse/` folder. The files in the repo stay unchanged.
  - Files listed in `.deployignore` (now just `CNAME`) are not uploaded.
  - The upload never deletes files on the server. To remove a file there, delete it by hand.

## Notes

- Cloudflare changes the pages it serves: it inlines Google Fonts, adds its own scripts and supplies `robots.txt`. These changes are not in the repo, and the files in `docs/` should not copy them.
- The `<lastmod>` dates in `docs/sitemap.xml` need updating by hand when pages change.
