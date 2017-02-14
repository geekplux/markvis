const md = require('markdown-it')();
const vis = require('./index.js');

console.log(md.use(vis).render(`
# Hello World

I'm **testing**!

\`\`\`js
console.log('language javascript')
\`\`\`

\`\`\`vis
{
  "data": {"url": "data/seattle-temps.csv"},
  "mark": "bar",
  "encoding": {
    "x": {
      "timeUnit": "month",
      "field": "date",
      "type": "temporal",
      "axis": {"shortTimeLabels": true}
    },
    "y": {
      "aggregate": "mean",
      "field": "temp",
      "type": "quantitative"
    }
  }
}
\`\`\`
`));
