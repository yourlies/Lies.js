import ObjectProcessor from '../lib/obj.js';
import StringProcessor from '../lib/str.js';

const detect = function (input) {
  const _detect = {};
  const detect = [];
  const rawRes = StringProcessor.matchCloseTag('{{', '}}', input);
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

const worker = function (ref, state, processer) {
  if (!ref.attributes) {
    return false;
  }
  const attributes = [];
  for (let i = 0; i < ref.attributes.length; i++) {
    attributes.push({ key: ref.attributes[i].name, value: ref.attributes[i].value })
  }
  for (let i = 0; i < attributes.length; i++) {
    const attrKey = attributes[i].key;
    if (!processer.matcher(attrKey)) {
      continue;
    }
    const template = `{{${attributes[i].value}}}`;
    const res = detect(template);
    const attrValue = template;
    const parentRef = ref.parentNode;
    const detects = res.detect;
    processer.compiler({ ref, parentRef, attrKey, attrValue, detects, template }, state);
  }
}

const render = function (ref, state) {
  const res = detect(ref.nodeValue);
  const cloneRef = ref.cloneNode(true);
  const watcher = function () {
    const renderRes = [];
    for (let i = 0; i < res.rawRes.length; i++) {
      if (res.rawRes[i].isClose) {
        renderRes.push(ObjectProcessor.read(res.rawRes[i].str, state));
      } else {
        renderRes.push(res.rawRes[i].str);
      }
    }
    ref.nodeValue = renderRes.join('');
  }

  for (let i = 0; i < res.detect.length; i++) {
    const detect = res.detect[i].substring(1);
    state.watch[detect] = ObjectProcessor.readAsArr(state.watch[detect]);
    state.watch[detect].push(watcher);
  }

  watcher();
}

module.exports = { detect, render, worker };