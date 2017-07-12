const fs = require('fs')
const d3node = require('d3-node')
const md = require('markdown-it')()
const vis = require('../src/index.js')

const testStr = md.use(vis).render(`
# Hello World

I'm **testing**!

## Test


    console.log('inline code');


\`\`\`js
console.log('language javascript')
\`\`\`

\`\`\`vis
layout: bar
data: [
  { key: 0, value: 5 },
  { key: 1, value: 4 },
  { key: 2, value: 7 },
  { key: 3, value: 2 },
  { key: 4, value: 4 },
  { key: 5, value: 8 },
  { key: 6, value: 3 },
  { key: 7, value: 6 }
]
\`\`\`


\`\`\`vis
layout: line
data: [
  { key: 0, value: 5 },
  { key: 1, value: 4 },
  { key: 2, value: 7 },
  { key: 3, value: 2 },
  { key: 4, value: 4 },
  { key: 5, value: 8 },
  { key: 6, value: 3 },
  { key: 7, value: 6 }
]
\`\`\`


\`\`\`vis
layout: pie
data: [
  { key: 0, value: 5 },
  { key: 1, value: 4 },
  { key: 2, value: 7 },
  { key: 3, value: 2 },
  { key: 4, value: 4 },
  { key: 5, value: 8 },
  { key: 6, value: 3 },
  { key: 7, value: 6 }
]
\`\`\`

\`\`\`vis
layout: no_layout
data: [
  { key: 0, value: 5 },
  { key: 1, value: 4 },
  { key: 2, value: 7 },
  { key: 3, value: 2 },
  { key: 4, value: 4 },
  { key: 5, value: 8 },
  { key: 6, value: 3 },
  { key: 7, value: 6 }
]
\`\`\`
`, {
  d3node
})

console.log(testStr)

fs.writeFile('./examples/basic.html', testStr, err => {
  if (err) throw err
  console.log('test saved!')
})
