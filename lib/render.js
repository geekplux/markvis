const yaml = require('js-yaml');
const d3nLine = require('d3node-linechart');
const d3nBar = require('d3node-barchart');

function render(tokens, idx, _options, env, self) {
  const token = tokens[idx];
  // if (token.hidden) return '';

  let doc;

  try {
    doc = yaml.load(token.content);
  } catch (e) {
    throw e;
  }

  let result = '';
  switch (doc.layout) {
  case 'bar':
    result = d3nBar({ data: doc.data }).chartHTML();
    break;
  case 'line':
    result = d3nLine({ data: doc.data }).chartHTML();
  }

  return result;
}

module.exports = render;
