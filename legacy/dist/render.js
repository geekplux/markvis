'use strict';

var yaml = require('js-yaml');
var markvisBar = require('markvis-bar');
var markvisLine = require('markvis-line');
var markvisPie = require('markvis-pie');

function render(options) {
  return function (tokens, idx, _options, env) {
    var token = tokens[idx];

    var doc = void 0;

    try {
      doc = yaml.load(token.content);
    } catch (err) {
      throw err;
    }

    var defaultChart = {
      bar: markvisBar,
      line: markvisLine,
      pie: markvisPie
    };

    var chart = defaultChart;

    if (options && Object.prototype.hasOwnProperty.call(options, 'chart')) {
      chart = Object.assign({}, defaultChart, options.chart);
    }

    var renderer = chart[doc.layout];

    var opts = Object.assign({}, options, env, doc);

    var result = renderer ? renderer(opts) : token.content;

    return result;
  };
}

module.exports = render;