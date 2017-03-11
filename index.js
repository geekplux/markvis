'use strict';


module.exports = function visPlugin (md, options) {
  options = options || {};

  function validate (params) {
    return params.trim().split(' ', 2)[0] === 'vis';
  }

  function render (tokens, idx, _options, env, self) {
    if (tokens[idx].nesting === 1) {
      tokens[idx].attrPush([ 'id', 'vis' ]);
      tokens[idx].attrPush([ 'class', 'vis' ]);
    }

    try {
      var doc = JSON.parse(JSON.stringify(tokens[idx].content));
    } catch (e) {
      console.error(e);
    }
    return self.renderToken(tokens, idx, _options, env, self);
  }


  var charLen = 3;  // length of ```

  function vis (state, startLine, endLine, silent) {
    var start = state.bMarks[startLine] + state.tShift[startLine];
    var max = state.eMarks[startLine];
    var pos = start + charLen;
    var markup = state.src.slice(start, pos);
    var params = state.src.slice(pos, max);

    if (!validate(params)) { return false; }

    if (silent) { return true; }

    var oldParent = state.parentType;
    var oldLineMax = state.lineMax;
    state.parentType = 'vis';
    state.lineMax = endLine;

    var token        = state.push('vis' + '_open', 'div', 1);
    token.markup = markup;
    token.block  = true;
    token.info   = params;
    token.map    = [ startLine, endLine ];
    token.content = state.getLines(startLine + 1, endLine - 1, state.blkIndent, true);

    state.md.block.tokenize(state, startLine + 1, endLine);

    token        = state.push('vis' + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block  = true;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = endLine;

    return true;
  }


  md.block.ruler.at('code', vis);
  md.renderer.rules['vis'+ '_open'] = render;
  md.renderer.rules['vis' + '_close'] = render;
};
