import ObjectProcessor from '../lib/obj.js';
import StringProcessor from '../lib/str.js';

const paramDetect = function (input) {
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

const render = function (ref, state) {
  const res = paramDetect(ref.nodeValue);
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

module.exports = { paramDetect, render };