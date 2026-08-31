# John Molina portfolio

Static software engineering portfolio for
[John R. Molina](https://freechie.github.io/). The site uses plain HTML, CSS,
and JavaScript and deploys to GitHub Pages. Hash-based navigation swaps four
single-viewport content panels without reloading the page. The site supports a
white-on-black dark theme and a minimal black-on-white light theme.

Additional pages: [DevTool keybindings](https://freechie.github.io/devtools) ·
[Algorithms tracker](https://freechie.github.io/algorithms)

## Local development

```bash
docker compose up
```

The site runs at [localhost:8080](http://localhost:8080).

Run the dependency-free validation checks separately with:

```bash
node scripts/validate-site.mjs
node scripts/check-external-links.mjs
```

GitHub Actions validates the structure, accessibility baseline, local assets,
and external links before deploying the contents of `site/` after each push to
`main`.

## License

MIT
