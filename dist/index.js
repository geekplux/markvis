'use strict';

const mdFence = require('markdown-it-fence');
const render = require('./render');

module.exports = function (md, options) {
  return mdFence(md, 'vis', {
    marker: '`',
    render: render(options)
  });
};