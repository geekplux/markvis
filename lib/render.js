const yaml = require('js-yaml')
// const d3nLine = require('d3node-linechart')
const markvisBar = require('markvis-bar')
// const d3nPie = require('d3node-piechart')

function render (options) {
  let d3 = null;
  let d3node = null;

  if (options.env === 'node') {
    d3node = require('d3-node');
  } else {
    d3 = require('d3');
  }

  return function (tokens, idx, _options, env, self) {
    const token = tokens[idx]
    // if (token.hidden) return '';

    let doc

    try {
      doc = yaml.load(token.content)
    } catch (err) {
      throw err
    }

    const chart = {
      bar: markvisBar,
      // line: d3nLine,
      // pie: d3nPie
    }

    const renderer = chart[doc.layout]
    const result = renderer ? renderer({ data: doc.data, d3, d3node })
          : JSON.stringify(doc, null, 2)

    return result
  }
}

module.exports = render
