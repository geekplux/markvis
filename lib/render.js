const D3Node = require('d3-node');

function render (tokens, idx, _options, env, self) {
  const token = tokens[idx];
  // if (token.hidden) return '';

  let result = '';

  try {
    var doc = JSON.parse(JSON.stringify(tokens[idx].content));
  } catch (e) {
    console.error(e);
  }

  var options = { selector: '#chart', container: '<div id="container"><div id="chart"></div></div>'};
  var d3n = new D3Node(options); // initializes D3 with container element
  d3 = d3n.d3;
  d3.select(d3n.document.querySelector('#chart')).append('span') // insert span tag into #chart
  result = d3n.html()   // output: <html><body><div id="container"><div id="chart"><span></span></div></div></body></html>

  return result;
}

module.exports = render;
