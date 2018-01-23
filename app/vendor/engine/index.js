import ObjectProcessor from '../lib/obj.js';
import Compiler from './compiler.js';
import Template from './template.js';
import Traverse from './traverse.js';

const processor = function (ref, state) {
  switch (true) {
    case ref.nodeType == 3:
      Template.render(ref, state);
      break;
    default:
      const { directive, events, normal } = Compiler.processor;
      const { worker } = Template;
      worker(ref, state, directive);
      worker(ref, state, events);
      worker(ref, state, normal);
      break;
  }
}
const rendering = function (ref, state) {
  const list = Compiler.processor.list;
  if (!list.matcher(ref)) {
    return false;
  }
  const parentRef = ref.parentNode;
  const attrValue = ref.getAttribute('~for');
  const { watcher, param } = list.compiler({
    ref, refClone: ref.cloneNode(true),
    parentRef, parentRefClone: parentRef.cloneNode(true), attrValue }, state);
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
  state.watch[param] = ObjectProcessor.readAsArr(state.watch[param]);
  state.watch[param].push(observer);
}

module.exports = { processor, rendering };