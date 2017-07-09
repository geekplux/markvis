const yaml = require('js-yaml')
const markvisBar = require('markvis-bar')
const markvisLine = require('markvis-line')
const markvisPie = require('markvis-pie')

function render (options) {
  return function (tokens, idx, _options, env, self) {
    const token = tokens[idx]
    // if (token.hidden) return '';

    let doc

    // load content
    try {
      doc = yaml.load(token.content)
    } catch (err) {
      throw err
    }

    const defaultChart = {
      bar: markvisBar,
      line: markvisLine,
      pie: markvisPie
    }

    // insert custom chart if any
    if (options.hasOwnProperty('chart')) {
      const chart = Object.assign({}, defaultChart, options.chart)
    }

    const renderer = chart[doc.layout]

    // all options merged
    const opts = Object.assign({}, options, env, doc)

    // render the content
    const result = renderer ? renderer(opts)
          : token.content

    return result
  }
}

module.exports = render
