<p align="center">
  <img width="250" src="./docs/markvis-logo.svg" alt="preview" />
</p>

# Markvis

> Make visualization in markdown.

[![NPM version](https://img.shields.io/npm/v/markvis.svg?style=flat-square)](https://npmjs.com/package/markvis) [![NPM downloads](https://img.shields.io/npm/dm/markvis.svg?style=flat-square)](https://npmjs.com/package/markvis) [![Build](https://travis-ci.org/geekplux/markvis.svg?style=flat-square)](https://travis-ci.org/geekplux/markvis) [![Coverage](https://coveralls.io/repos/github/geekplux/markvis/badge.svg?style=flat-square)](https://coveralls.io/github/geekplux/markvis) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://geekplux.github.io/donate)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fgeekplux%2Fmarkvis.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fgeekplux%2Fmarkvis?ref=badge_shield)

[Documentation](https://markvis.js.org)

## Preview

![](./docs/preview.png)

## Install

```bash
yarn add markvis --save
npm install markvis --save
```

## Usage

```js
const md = require('markdown-it')()
const vis = require('markvis')
const d3 = require('d3')  // in browser environment
const d3node = require('d3-node') // in node environment

md.use(vis).render(`
  your makrdown content
`, {
  d3,    // in browser environment
  d3node // in node environment
})
```

there are [Examples](./test/test.js) which in node environment.

## Why

Very often we need to insert some data into our articles to make them more convincing, and since we are more sensible of information in charts than statistics, how to easily and conveniently embed a chart in an article is important. However, common method is to export a chart as an image, then upload it to an Image Hosting and get a url, finally paste the url to editor, which is a tedious process from writer's perspective.

Also, it makes the image loading time become much longer than that of the DOM elements, which may be/is a bad experience from reader's  perspective.


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## LICENSE

**markvis** © [geekplux](https://github.com/geekplux), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by geekplux with help from contributors ([list](https://github.com/geekplux/markvis/contributors)).

> [geekplux.com](http://geekplux.com) · GitHub [@geekplux](https://github.com/geekplux) · Twitter [@geekplux](https://twitter.com/geekplux)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fgeekplux%2Fmarkvis.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fgeekplux%2Fmarkvis?ref=badge_large)
