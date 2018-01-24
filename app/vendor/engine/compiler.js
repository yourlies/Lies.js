import DirectiveProcessor from '../lib/directive.js';
import ObjectProcessor from '../lib/obj.js';
import Expand from '../expand/index.js';

// compiler element directive attribute
const directiveHotMap = {
  'if': true,
  'focus': true,
};
const directive = {};
directive.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'i-';
}
directive.compiler = function (params, state) {
  const { ref, parentRef, attrKey, attrValue, detects } = params;
  const cloneRef = ref.cloneNode(true);
  const processer = attrKey.substring(2);
  const watcher = () => {
    DirectiveProcessor[processer](ref, parentRef, attrValue, state, cloneRef);
  }
  watcher();
  for (let j = 0; j < detects.length; j++) {
    const detect = detects[j].substring(1);
    state.watch[detect] = ObjectProcessor.readAsArr(state.watch[detect]);
    state.watch[detect].push(watcher);
  }
}
// compiler element events attribute
const events = {};
events.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'e-';
}
events.compiler = function (params, state) {
  const { ref, attrKey, attrValue } = params;

  ref.removeAttribute(attrKey);
  ref.addEventListener(attrKey.substring(2), (e) => {
    setTimeout(() => {
      if (attrValue.match(/\([a-z0-9.@]+\)/i)) {
        ObjectProcessor.read(attrValue, state);
      } else {
        state.$events = state.$events || {};
        state.$events.e = e;
        ObjectProcessor.read(attrValue.replace('}}', '(@$events.e)}}'), state);
      }
    })
  });
}
// compiler element normal attribute
const normal = {};
normal.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'r-';
}
normal.compiler = function (params, state) {
  const { ref, attrKey, template, detects } = params;
  const replaceAttr = attrKey.substring(1);
  const replaceValue = ObjectProcessor.read(template, state);
  ref.removeAttribute(attrKey);
  ref.setAttribute(replaceAttr, replaceValue);
  var watcher = function () {
    const value = ObjectProcessor.read(template, state);
    ref.setAttribute(replaceAttr, value);
  }
  for (let j = 0; j < detects.length; j++) {
    const detect = detects[j].substring(1);
    state.watch[detect] = ObjectProcessor.readAsArr(state.watch[detect]);
    state.watch[detect].push(watcher);
  }
}
// compiler element list attribute
const list = {};
list.matcher = function (ref) {
  return ref.getAttribute && ref.getAttribute('i-for');
}
list.compiler = function (input, state) {
  const { ref, refClone, parentRef, parentRefClone } = input;
  const watcher = (hook) => {
    DirectiveProcessor['for'](ref, parentRef, refClone, parentRefClone, state);
    if (typeof hook == 'function') {
      hook();
    }
  }
  return { watcher };
}

module.exports = { processor: { directive, events, normal, list } };