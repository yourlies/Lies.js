import DirectiveProcessor from '../lib/directive.js';
import ObjectProcessor from '../lib/obj.js';
import Pattern from '../lib/pattern.js';
import Expand from '../expand/index.js';

// compiler element directive attribute
const directiveHotMap = {
  if: true,
  show: true,
  focus: true,
};
const directive = {};
directive.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'i-';
}
directive.compiler = function ({ ref, name, value, detect, state }) {
  const parentRef = ref.parentNode;
  const cloneRef = ref.cloneNode(true);
  const processer = name.substring(2);
  ref.removeAttribute(name);
  const watcher = () => {
    DirectiveProcessor[processer]({
      ref, parentRef, cloneRef, value, state,
    });
  }
  watcher();
  if (!directiveHotMap[processer]) {
    return false;
  }
  for (let i = 0; i < detect.length; i++) {
    const param = detect[i].substring(1);
    state.watch[param] = ObjectProcessor.readAsArr(state.watch[param]);
    state.watch[param].push(watcher);
  }
}
// compiler element events attribute
const events = {};
events.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'e-';
}
events.compiler = function ({ ref, name, value, detect, state }) {
  ref.removeAttribute(name);
  const event = name.substring(2);
  ref.addEventListener(event, (e) => {
    setTimeout(() => {
      if (value.match(Pattern.maps.funcwithparam)) {
        ObjectProcessor.read(value, state);
      } else {
        state.$events = state.$events || {};
        state.$events.e = e;
        ObjectProcessor.read(`${value}(@$events.e)`, state);
      }
    })
  });
}
// compiler element normal attribute
const normal = {};
normal.matcher = function (attrKey) {
  return attrKey.substring(0, 2) == 'r-';
}
normal.compiler = function ({ ref, name, value, detect, state }) {
  const renderName = name.substring(2);
  const renderValue = ObjectProcessor.read(value, state);
  ref.removeAttribute(name);
  ref.setAttribute(renderName, renderValue);
  const watcher = function () {
    const renderValue = ObjectProcessor.read(value, state);
    ref.setAttribute(renderName, renderValue);
  }
  for (let i = 0; i < detect.length; i++) {
    const param = detect[i].substring(1);
    state.watch[param] = ObjectProcessor.readAsArr(state.watch[param]);
    state.watch[param].push(watcher);
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