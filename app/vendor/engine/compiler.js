import DirectiveProcessor from '../lib/directive.js';
import TemplateProcessor from './template.js';
import ObjectProcessor from '../lib/obj.js';

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
    if (!processer.macther(attrKey)) {
      continue;
    }
    const template = `{{${attributes[i].value}}}`;
    const res = TemplateProcessor.paramDetect(template);
    const attrValue = template;
    const parentRef = ref.parentNode;
    const detects = res.detect;
    processer.compiler({ ref, parentRef, attrKey, attrValue, detects, template }, state);
  }
}
// compiler element directive attribute
const directiveHotMap = {
  'if': true,
  'focus': true,
};
const directive = {};
directive.macther = function (attrKey) {
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
  if (directiveHotMap[processer]) {
    for (let j = 0; j < detects.length; j++) {
      const detect = detects[j].substring(1);
      state.watch[detect] = ObjectProcessor.readAsArr(state.watch[detect]);
      state.watch[detect].push(watcher);
    }
  }
}
// compiler element events attribute
const events = {};
events.macther = function (attrKey) {
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
normal.macther = function (attrKey) {
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

module.exports = { worker, processor: { directive, events, normal } };