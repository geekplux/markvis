<script>
  import { render } from "markvis";

  /** The text inside a chart, markvis, or vis code block. */
  let { source } = $props();
  const html = $derived(render(source).html);
</script>

<div class="markvis-host">{@html html}</div>
