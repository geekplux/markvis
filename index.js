'use strict'

const mdFence = require('markdown-it-fence')
const render = require('./lib/render')

module.exports = function (md, options) {
  return mdFence(md, 'vis', {
    marker: '`',
    render
  })
}
