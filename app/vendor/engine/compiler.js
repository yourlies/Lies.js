import DirectiveProcessor from '../lib/directive.js';
import ObjectProcessor from '../lib/obj.js';

// compiler element directive attribute
const directiveHotMap = {
  'if': true,
  'focus': true,
};
const directive = {};
directive.matcher = function (attrKey) {
  return attrKey[0] == '~';
}
directive.compiler = function (params, state) {
  const { ref, parentRef, attrKey, attrValue, detects } = params;
  const cloneRef = ref.cloneNode(true);
  const processer = attrKey.substring(1);
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
  return attrKey[0] == '@';
}
events.compiler = function (params, state) {
  const { ref, attrKey, attrValue } = params;
  ref.removeAttribute(attrKey);
  ref.addEventListener(attrKey.substring(1), (e) => {
    setTimeout(() => {
      if (attrValue.match(/\([a-z0-9.@]+\)/)) {
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
  return attrKey[0] == ':';
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
  return ref.getAttribute && ref.getAttribute('~for');
}
list.compiler = function (input, state) {
  const { ref, refClone, parentRef, parentRefClone, attrValue } = input;

  ref.removeAttribute('~for');
  const params = ObjectProcessor.readAsTrimArr(attrValue.split(' in '));
  const watcher = (hook) => {
    DirectiveProcessor['for'](ref, parentRef, attrValue, state, refClone, parentRefClone);
    if (typeof hook == 'function') {
      hook();
    }
  }
  return { watcher, param: params[1] };
}

module.exports = { processor: { directive, events, normal, list } };