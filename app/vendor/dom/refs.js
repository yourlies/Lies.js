import Obj from '../lib/obj.js';
import Compiler from '../engine/compiler.js';
import Template from '../engine/template.js';
import Traverse from '../engine/traverse.js';

const Refs = function (state, hash) {
  this.hash = hash;
  this.rawRefs = Traverse.getComponentTemplate(`[ref=${state.id}]`);
  this.state = state;
  
  const refs = this._combineRefs();
  if (refs) {
    this.renderRawRefs(refs.normal);
    this.renderSpecialRefs(refs.special);
  }
};

Refs.prototype._combineRefs = function () {
  this.refs = {};
  for (let i = 0; i < this.rawRefs.length; i++) {
    if (this.rawRefs[i].getAttribute && !this.rawRefs[i].getAttribute('ref-id')) {
      this.rawRefs[i].setAttribute('ref-id', this.hash);
    }
    const refState = Traverse.getTraversalTemplate(this.rawRefs[i]);
    if (refState.refs[this.state.id]) {
      this.refs[this.state.id] = this.refs[state.id] || {
        normal: [],
        special: [],
      };
      const { normal, special } = this.refs[this.state.id];
      this.refs[this.state.id].normal = normal.concat(refState.refs[this.state.id].normal);
      this.refs[this.state.id].special = special.concat(refState.refs[this.state.id].special);
    }
  }
  if (!this.refs[this.state.id]) {
    return false;
  }

  for (let i = 0; i < this.rawRefs.length; i++) {
    this.rawRefs[i].removeAttribute('ref');
  }
  return this.refs[this.state.id];
}
Refs.prototype.renderSpecialRefs = function (refs) {
  const list = Compiler.processor.list;
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    if (!list.matcher(ref)) {
      continue;
    }
    const parentRef = ref.parentNode;
    const attrValue = refs[i].getAttribute('~for');
    const { watcher, param } = list.compiler({
      ref, refClone: ref.cloneNode(true),
      parentRef, parentRefClone: parentRef.cloneNode(true), attrValue }, this.state);

    const observer = () => {
      watcher(() => {
        const res = Traverse.getTraversalTemplate(parentRef);
        let rawRefs = [];
        if (res.refs[state.id]) {
          rawRefs = res.refs[state.id].normal;
        } else {
          rawRefs = res.refs.unkind.normal;
        }
        this.renderRawRefs(rawRefs);
      });
    }
    observer();
    this.state.watch[param] = Obj.readAsArr(this.state.watch[param]);
    this.state.watch[param].push(observer);
  }
}
Refs.prototype.renderRawRefs = function (refs) {
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    switch (true) {
      case ref.nodeType == 3:
        Template.render(ref, this.state);
        break;
      default:
        const { directive, events, normal } = Compiler.processor;
        const { worker } = Template;
        worker(ref, this.state, directive);
        worker(ref, this.state, events);
        worker(ref, this.state, normal);
        break;
    }
  }
}

module.exports = Refs;