# One script tag

`page.md` is plain Markdown. `index.html` turns it into HTML with marked from a CDN and calls `markvis.run()`, because the page arrives after load. When the Markdown is already HTML at load (a static site), the script tag alone is enough: it draws once the DOM is ready.

```bash
pnpm build
python3 -m http.server 8000   # from the repository root
# open http://localhost:8000/examples/hosts/script-tag/
```

From a CDN instead of this repository: `https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js`.
