const Ref = {};
Ref.removeAttr = function (ref, tag) {
  const pattern = new RegExp(`${tag}="(.*?)"`, 'g');
  if (typeof ref == 'string') {
    return ref.replace(pattern, '');
  } else {
    ref.removeAttribute(tag)
  }
}
module.exports = Ref;