import Obj from '../lib/obj.js';
import Ref from '../lib/ref.js';
import Directive from '../lib/directive.js';
import Compiler from '../engine/compiler.js';
import Template from '../engine/template.js';

const Refs = function (state, hash) {
  this.hash = hash;
  this.rawRefs = this._getNeedRenderRefs(state.id);
  this.refs = {};
  for (let i = 0; i < this.rawRefs.length; i++) {
    if (this.rawRefs[i].getAttribute && !this.rawRefs[i].getAttribute('ref-id')) {
      this.rawRefs[i].setAttribute('ref-id', this.hash);
    }
    const refState = Ref.getTraversalTemplate(this.rawRefs[i]);
    if (refState.refs[state.id]) {
      this.refs[state.id] = this.refs[state.id] || {
        normal: [],
        special: [],
      };
      this.refs[state.id].normal = this.refs[state.id].normal.concat(refState.refs[state.id].normal);
      this.refs[state.id].special = this.refs[state.id].special.concat(refState.refs[state.id].special);
    }
  }
  if (!this.refs[state.id]) {
    return false;
  }
  this.state = state;

  for (let i = 0; i < this.rawRefs.length; i++) {
    this.rawRefs[i].removeAttribute('ref');
  }

  const rawRefs = this.refs[this.state.id];

  this._renderRawRefs(rawRefs.normal);
  this._renderSpecialRefs(rawRefs.special);
};

Refs.prototype._getNeedRenderRefs = function (refId) {
  const refsContainer = [];
  const refs = document.querySelectorAll(`[ref=${refId}]`);
  for (let i = 0; i < refs.length; i++) {
    refsContainer.push(refs[i]);
  }
  for (let i = 0; i < self.state.$els.length; i++) {
    const refsChips = self.state.$els[i].querySelectorAll(`[ref=${refId}]`);
    for (let j = 0; j < refsChips.length; j++) {
      refsContainer.push(refsChips[j]);
    }
  }
  return refsContainer;
}
Refs.prototype._renderSpecialRefs = function (refs) {
  const renderRefs = [];

  for (let i = 0; i < refs.length; i++) {
    if (!refs[i].getAttribute || !refs[i].getAttribute('~for')) {
      continue;
    }
    const ref = refs[i];
    const refClone = ref.cloneNode(true);
    const parentRef = refs[i].parentNode;
    const parentRefClone = parentRef.cloneNode(true);
    const attrValue = refs[i].getAttribute('~for');
    ref.removeAttribute('~for');
    const params = Obj.readAsTrimArr(attrValue.split(' in '));
    const watcher = () => {
      Directive['for'](ref, parentRef, attrValue, this.state, refClone, parentRefClone);
      const res = Ref.getTraversalTemplate(parentRef);
      let rawRefs = [];
      if (res.refs[this.state.id]) {
        rawRefs = res.refs[this.state.id].normal;
      } else {
        rawRefs = res.refs.unkind.normal;
      }
      this._renderRawRefs(rawRefs);
    }
    watcher();
    this.state.watch[params[1]] = Obj.readAsArr(this.state.watch[params[1]]);
    this.state.watch[params[1]].push(watcher);
  }
}
Refs.prototype._renderRawRefs = function (refs) {
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    switch (true) {
      case ref.nodeType == 3:
        Template.render(ref, this.state);
        break;
      default:
        const { directive, events, normal } = Compiler.processor;
        Compiler.worker(ref, this.state, directive);
        Compiler.worker(ref, this.state, events);
        Compiler.worker(ref, this.state, normal);
        break;
    }
  }
}

module.exports = Refs;