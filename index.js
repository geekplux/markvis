'use strict';

const render = require('./lib/render');

module.exports = function visPlugin (md, options) {
  options = options || {};

  function validate (params) {
    return params.trim().split(' ', 2)[0] === 'vis';
  }


  function vis (state, startLine, endLine/*, silent*/) {
    var marker, len, params, nextLine, mem, token, markup,
    haveEndMarker = false,
    pos = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];

    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (pos + 3 > max) return false;

    marker = state.src.charCodeAt(pos);

    if (marker !== 0x60 /* ` */) return false;

    mem = pos;
    pos = state.skipChars(pos, marker);
    len = pos - mem;

    if (len < 3) return false;

    markup = state.src.slice(mem, pos);
    params = state.src.slice(pos, max);

    if (params.indexOf(String.fromCharCode(marker)) >= 0) return false;

    nextLine = startLine;

    while (1) {
      nextLine++;
      if (nextLine >= endLine) break;

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] < state.blkIndent) break;
      if (state.src.charCodeAt(pos) !== marker) continue;
      if (state.sCount[nextLine] - state.blkIndent >= 4) continue;

      pos = state.skipChars(pos, marker);

      if (pos - mem < len) continue;

      pos = state.skipSpaces(pos);

      if (pos < max) continue;

      haveEndMarker = true;
      // found!
      break;
    }

    len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);

    if (validate(params)) token = state.push('vis', 'div', 0);
    else token = state.push('fence', 'code', 0);
    token.info = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = markup;
    token.map = [ startLine, state.line ];

    return true;
  }


  md.block.ruler.before('fence', 'vis', vis, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]});
  md.renderer.rules.vis = render;
};
