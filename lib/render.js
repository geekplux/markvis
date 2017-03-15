const yaml = require('js-yaml');
const d3nLine = require('d3node-linechart');

function render(tokens, idx, _options, env, self) {
  const token = tokens[idx];
  // if (token.hidden) return '';

  let doc;

  try {
    doc = yaml.load(token.content);
  } catch (e) {
    throw e;
  }

  return d3nLine({ data: doc.data }).html();
}

module.exports = render;
