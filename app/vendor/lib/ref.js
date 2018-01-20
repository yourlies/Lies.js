import Obj from './obj.js';
import Str from './str.js';

const state = {};
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
        || Ref.ifParentNodeMatchAttr(ref, '~for=*')) {
          refs[refName].special.push(ref);
        } else {
        refs[refName].normal.push(ref);
      }
    }
    state._getTraversalTemplate(ref, refs, refName, refSpecial, refId);
  }
}
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
    if (replaceTag) {
      ref.removeAttribute(tag);
      ref.setAttribute(replaceTag, replaceValue);
    } else {
      ref.removeAttribute(tag);
    }
  }
}
Ref.removeAttr = function (ref, tag) {
  return this.replaceAttr(ref, tag, '', '');
}
Ref.ifParentNodeMatchAttr = function (node, match) {
  let parentRef = node;
  const chips = Obj.readAsTrimArr(match.split('='));
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
Ref.detectParam = function (input) {
  const _detect = {};
  const detect = [];
  const rawRes = Str.matchCloseTag('{{', '}}', input);
  for (let i = 0; i < rawRes.length; i++) {
    if (!rawRes[i].isClose) {
      continue;
    } else {
      const matches = rawRes[i].str.match(/@([a-z0-9.]+)/gi) || [];
      for (let j = 0; j < matches.length; j++) {
        _detect[matches[j]] = true;
      }
    }
  }
  for (let pro in _detect) {
    detect.push(pro);
  }
  return { rawRes, detect };
}
Ref.getTraversalTemplate = function (el) {
  const refs = {};
  state._getTraversalTemplate(el, refs);
  return { refs };
}
Ref.renderTemplate = function (ref, state) {
  const res = this.detectParam(ref.nodeValue);
  const cloneRef = ref.cloneNode(true);


  const watcher = function () {
    const renderRes = [];
    for (let i = 0; i < res.rawRes.length; i++) {
      if (res.rawRes[i].isClose) {
        renderRes.push(Obj.read(res.rawRes[i].str, state));
      } else {
        renderRes.push(res.rawRes[i].str);
      }
    }
    ref.nodeValue = renderRes.join('');
  }

  for (let i = 0; i < res.detect.length; i++) {
    const detect = res.detect[i].substring(1);
    state.watch[detect] = Obj.readAsArr(state.watch[detect]);
    state.watch[detect].push(watcher);
  }

  watcher();
}
Ref.renderAttr = function (ref, state, { key, replaceAttr, handle }) {
  if (!ref.attributes) {
    return false;
  }
  const attrs = [];
  for (let i = 0; i < ref.attributes.length; i++) {
    attrs.push({ name: ref.attributes[i].name, value: ref.attributes[i].value })
  }
  for (let i = 0; i < attrs.length; i++) {
    const attrKey = attrs[i].name;
    if (attrKey[0] != key) {
      continue;
    }
    const template = `{{${attrs[i].value}}}`;
    const res = this.detectParam(template);

    let watcher = '';
    if (!handle) {
      const replaceAttr = attrKey.substring(1);
      const replaceValue = Obj.read(template, state);
      this.replaceAttr(ref, attrKey, replaceAttr, replaceValue);
      watcher = function () {
        const value = Obj.read(template, state);
        ref.setAttribute(replaceAttr, value);
      }
      for (let j = 0; j < res.detect.length; j++) {
        const detect = res.detect[j].substring(1);
        state.watch[detect] = Obj.readAsArr(state.watch[detect]);
        state.watch[detect].push(watcher);
      }
    } else {
      const attrValue = template;
      const parentRef = ref.parentNode;
      const detects = res.detect;
      handle({ ref, parentRef, attrKey, attrValue, detects });
    }
  }
}
module.exports = Ref;