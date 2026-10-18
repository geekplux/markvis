# MkDocs

`mkdocs.yml` adds one custom fence and the drop-in script. Without the custom fence, `pymdownx.highlight` does not keep the language name on the block, and the chart stays a code block (the comment form still draws).

```bash
pip install mkdocs pymdown-extensions
mkdocs serve
```

Add `markvis` and `vis` the same way if you use those tags.
