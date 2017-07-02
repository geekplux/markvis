const fs = require('fs')
const md = require('markdown-it')()
const vis = require('../index.js')

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
`)

console.log(testStr)

fs.writeFile('./test/test.html', testStr, err => {
  if (err) throw err
  console.log('test saved!')
})
