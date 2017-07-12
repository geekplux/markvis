const fs = require('fs')
const d3node = require('d3-node')
const md = require('markdown-it')()
const vis = require('../src/index.js')
const content = require('./content')

const testStr = md.use(vis).render(content(), { d3node })

fs.writeFile('./examples/basic.html', testStr, err => {
  if (err) throw err
  console.log('test saved!')
})
