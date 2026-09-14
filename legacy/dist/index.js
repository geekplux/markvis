'use strict';

var mdFence = require('markdown-it-fence');
var render = require('./render');

module.exports = function (md, options) {
  return mdFence(md, 'vis', {
    marker: '`',
    render: render(options)
  });
};