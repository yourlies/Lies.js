const Ref = {};
Ref.replaceAttr = function (ref, tag, replaceTag, replaceValue) {
  const pattern = new RegExp(`${tag}="(.*?)"`, 'g');
  if (typeof ref == 'string') {
    if (replaceTag == '') {
      return ref.replace(pattern, '');
    } else {
      return ref.replace(pattern, `~${replaceTag}=${replaceValue}`);
    }
  } else {
    ref.removeAttribute(tag)
  }
}
Ref.removeAttr = function (ref, tag) {
  return this.replaceAttr(ref, tag, '', '');
}
Ref.detectParam = function (input) {
  const outPut = [];
  const chips = input.match(/@([a-z0-9.]+)/gi);
  if (chips) {
    for (let i = 0; i < chips.length; i++) {
      outPut.push(chips[i].substring(1, chips[i].length));
    }
    return { arr: outPut, isEval: true }
  } else {
    return { arr: [input], isEval: false };
  }
}
module.exports = Ref;