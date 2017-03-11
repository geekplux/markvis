function render (tokens, idx, _options, env, self) {
  const token = tokens[idx];

  token.attrPush([ 'id', 'vis' ]);
  token.attrPush([ 'class', 'vis' ]);

  try {
    var doc = JSON.parse(JSON.stringify(tokens[idx].content));
  } catch (e) {
    console.error(e);
  }

  // if (token.hidden) return '';

  return doc
}

module.exports = render;
