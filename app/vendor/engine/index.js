import ObjectProcessor from '../lib/obj.js';
import StringProcessor from '../lib/str.js';
import Compiler from './compiler.js';
import Template from './template.js';
import Traverse from './traverse.js';
import Expand from '../expand/index.js';

const { directive, events, normal } = Compiler.processor;
const { worker } = Template;
const processor = function (ref, state) {
  switch (true) {
    case ref.nodeType == 3:
      Expand.template(ref, state);
      Template.render(ref, state);
      break;
    case ref.nodeType == 8:
      break;
    default:
      if (!ref.attributes) {
        break;
      }
      const attributes = ObjectProcessor.extendArr(ref.attributes);
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        Expand.attribute(attribute, state);
        worker({ attribute, state, processor: normal, ref });
        worker({ attribute, state, processor: directive, ref });
        worker({ attribute, state, processor: events, ref });
      }
      break;
  }
}
const rendering = function (ref, state) {
  const list = Compiler.processor.list;
  if (!list.matcher(ref)) {
    return false;
  }

  const refClone = ref.cloneNode(true);

  const condition = ref.getAttribute('i-for');
  const params = condition.split(' in ');
  const name = params[1].trim();
  let param = params[0];
  param = StringProcessor.ltrim(param, '(');
  param = StringProcessor.rtrim(param, ')');
  const chips = param.split(',');
  const key = chips[0].trim();
  const index = (chips[1] || '').trim();
  if (index) {
    refClone.setAttribute('i-for-index', index);
  }
  refClone.setAttribute('i-for-key', key);
  refClone.setAttribute('i-for-name', name);
  ref.removeAttribute('i-for');

  const renderRefs = Traverse.getTraversalTemplate(ref).refs;
  renderRefs.unkind.normal.push(ref);
  for (let i = 0; i < renderRefs.unkind.normal.length; i++) {
    const renderRef = renderRefs.unkind.normal[i];
    Expand.list({ ref: renderRef, key, index, state });
  }

  const parentRef = ref.parentNode;

  const { watcher } = list.compiler({ ref, parentRef, refClone }, state);

  const observer = () => {
    watcher(() => {
      const res = Traverse.getTraversalTemplate(parentRef);
      let rawRefs = [];
      if (res.refs[state.id]) {
        rawRefs = res.refs[state.id].normal;
      } else {
        rawRefs = res.refs.unkind.normal;
      }
      for (let i = 0; i < rawRefs.length; i++) {
        const ref = rawRefs[i];
        processor(ref, state);
      }
    });
  }
  observer();
  state.watch[name] = ObjectProcessor.readAsArr(state.watch[name]);
  state.watch[name].push(observer);
}

module.exports = { processor, rendering };