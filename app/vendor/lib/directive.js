import Obj from './obj.js';

const directives = {};
directives.if = function (ref, parentRef, attrValue, state) {
  const value = Obj.read(attrValue, state);
  if (!value) {
    parentRef.removeChild(ref);
    return false;
  }
  parentRef.appendChild(ref);
}
directives.key = function (ref, parentRef, attrValue, state) {
  const replaceAttrs = ref.getAttributeNames();
  for (let i = 0; i < replaceAttrs.length; i++) {
    if (!replaceAttrs[i].match(':')) {
      continue;
    }
    const chips = Obj.readAsTrimArr(attrValue.split(','));
    const name = chips[0];
    const key = chips[1];
    const index = chips[2];
    const indexKey = chips[3];

    const value = ref.getAttribute(replaceAttrs[i]);

    const pattern = new RegExp(`~${indexKey}|~${name}`, 'g');
    const parseAttrValue = value.replace(pattern, function (match) {
      const filterIndex = match.replace(`~${indexKey}`, index);
      return filterIndex.replace(`~${name}`, `@${key}`)
    })
    ref.setAttribute(replaceAttrs[i], parseAttrValue);
  }
}

module.exports = directives;
