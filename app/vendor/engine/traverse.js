import ObjectProcessor from '../lib/obj.js';

const state = {};
state.ifParentNodeMatchAttr = function (node, match) {
  let parentRef = node;
  const chips = ObjectProcessor.readAsTrimArr(match.split('='));
  while (!document.body.isEqualNode(parentRef) && parentRef) {
    if (!parentRef.getAttribute) {
      parentRef = parentRef.parentNode;
      continue;
    }
    const attrValue = parentRef.getAttribute(chips[0]);
    if (attrValue && chips[1] == '*') {
      return true;
    } else if (attrValue) {
      return attrValue == chips[1];
    }
    parentRef = parentRef.parentNode;
  }
  return false;
}
state._getTraversalTemplate = function (el, refs, refName, refSpecial, refId) {
  if (!el || !el.childNodes) {
    return false;
  }
  refName = refName || 'unkind';
  if (el.getAttribute) {
    refName = el.getAttribute('ref') || refName;
    refSpecial = el.getAttribute('~for') && el;
    refId = el.getAttribute('ref-id') || refId;
    if (refId) {
      el.setAttribute(`lies-id-${refId}`, '');
    }
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    const ref = el.childNodes[i];
    if (ref.nodeType == 3 && !/\S/.test(ref.nodeValue)) {
      ref.parentNode.removeChild(ref);
      i--;
    } else {
      refs[refName] = refs[refName] || { normal: [], special: [] };
      if ((refSpecial && refSpecial.contains(ref))
        || (ref.getAttribute && ref.getAttribute('~for'))
        || state.ifParentNodeMatchAttr(ref, '~for=*')) {
          refs[refName].special.push(ref);
        } else {
        refs[refName].normal.push(ref);
      }
    }
    state._getTraversalTemplate(ref, refs, refName, refSpecial, refId);
  }
}

const getTraversalTemplate = function (el) {
  const refs = {};
  state._getTraversalTemplate(el, refs);
  return { refs };
}
const getComponentTemplate = function (refId) {
  const refsContainer = [];
  const refs = document.querySelectorAll(refId);
  for (let i = 0; i < refs.length; i++) {
    refsContainer.push(refs[i]);
  }
  for (let i = 0; i < self.state.$els.length; i++) {
    const refsChips = self.state.$els[i].querySelectorAll(refId);
    for (let j = 0; j < refsChips.length; j++) {
      refsContainer.push(refsChips[j]);
    }
  }
  return refsContainer;
}

module.exports = { getComponentTemplate, getTraversalTemplate };