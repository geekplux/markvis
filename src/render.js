const yaml = require('js-yaml')
const markvisBar = require('markvis-bar')
const markvisLine = require('markvis-line')
const markvisPie = require('markvis-pie')

function render (options) {
  return function (tokens, idx, _options, env) {
    const token = tokens[idx]

    let doc

    // Load content
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

    let chart = defaultChart

    // Insert custom chart if any
    if (options && Object.prototype.hasOwnProperty.call(options, 'chart')) {
      chart = Object.assign({}, defaultChart, options.chart)
    }

    const renderer = chart[doc.layout]

    // All options merged
    const opts = Object.assign({}, options, env, doc)

    // Render the content
    const result = renderer ? renderer(opts) : token.content

    return result
  }
}

module.exports = render
