const yaml = require('js-yaml')
const d3nLine = require('d3node-linechart')
const markvisBar = require('markvis-bar')
const d3nPie = require('d3node-piechart')

function render (tokens, idx, _options, env, self) {
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
    line: d3nLine,
    pie: d3nPie
  }

  const renderer = chart[doc.layout]
  const result = renderer ? renderer({ data: doc.data }) :
        JSON.stringify(doc, null, 2)

  return result
}

module.exports = render
