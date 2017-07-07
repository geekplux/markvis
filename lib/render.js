const yaml = require('js-yaml')
const markvisBar = require('markvis-bar')
const markvisLine = require('markvis-line')
const markvisPie = require('markvis-pie')

function render (options) {
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
      line: markvisLine,
      pie: markvisPie
    }

    const renderer = chart[doc.layout]
    const opts = Object.assign({}, options, env, doc)
    const result = renderer ? renderer(opts)
          : token.content

    return result
  }
}

module.exports = render
