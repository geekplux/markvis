# markvis preview (VS Code)

Renders `chart` / `markvis` / `vis` fences (and HTML comment + GFM table charts) as SVG in the built-in Markdown preview.

Sideload only. **Do not publish to the Marketplace.**

## Install from folder

1. Open this repo in VS Code.
2. Run **Extensions: Install from Location...** (or drag the folder) and pick:

   `extensions/vscode-markvis-preview`

   If that command is missing, copy the folder into `~/.vscode/extensions/` and reload.

3. Open any `.md` with a markvis fence and use **Markdown: Open Preview**.

Requires a compiled `dist/extension.js` (committed in this repo). To rebuild:

```bash
cd extensions/vscode-markvis-preview
npx --yes esbuild src/extension.ts --bundle --platform=node --format=cjs --outfile=dist/extension.js --external:vscode
```

## Package a `.vsix` (optional, local)

```bash
cd extensions/vscode-markvis-preview
npx --yes @vscode/vsce package --allow-missing-repository
```

Then **Install from VSIX...** in VS Code. Still do not publish.

## Frozen language

Types: `bar` | `line` | `area` | `scatter` | `pie` | `hist`. No theme field. No d3.
