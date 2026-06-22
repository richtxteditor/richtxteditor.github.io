# freechie.github.io

Personal portfolio site for John Molina — software engineer based in NJ.

**Live:** [freechie.github.io](https://freechie.github.io)

**DevTool Keybinds:** [freechie.github.io/devtools](https://freechie.github.io/devtools)

**DSA Topic Tracker:** [freechie.github.io/dsa](https://freechie.github.io/dsa)

## Stack

- Modular HTML, CSS, and JavaScript (no frameworks or runtime dependencies)
- Dark/light theme toggle with `prefers-color-scheme` support
- SEO metadata, structured data, sitemap, and crawler directives
- Deployed via GitHub Actions to GitHub Pages

Deployable files live in `site/`; repository tooling and documentation remain
outside the published artifact.

## Local Development

```bash
docker compose up
```

Site is served at [localhost:8080](http://localhost:8080).

Run the dependency-free validation checks with:

```bash
node scripts/validate-site.mjs
```

## SEO Rollout

After deploying metadata or content changes:

1. Submit `https://freechie.github.io/sitemap.xml` in
   [Google Search Console](https://search.google.com/search-console).
2. Inspect `https://freechie.github.io/` and request indexing.
3. Keep the name, role, location, and portfolio URL aligned across GitHub,
   LinkedIn, and X (`@freechiee`).
4. Review Search Console impressions for branded queries each week.

## License

MIT
