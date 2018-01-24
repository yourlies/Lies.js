import Traverse from '../engine/traverse.js';
import Engine from '../engine/index.js';

const Refs = function (state, hash) {
  this.hash = hash || '';
  this.state = state;

  if (this.state.id.nodeType) {
    this.state.id.setAttribute('ref', this.state.refId);
    this.state.$el = this.state.id;
    this.rawRefs = [this.state.id];
    this.state.id = this.state.refId;
    delete this.state.refId;
  } else {
    this.rawRefs = Traverse.getComponentTemplate(`[ref=${state.id}]`);
  }
  
  const refs = this._combineRefs();

  if (refs) {
    this.renderRawRefs(refs.normal);
    this.renderSpecialRefs(refs.special);
  }
};

Refs.prototype._combineRefs = function () {
  this.refs = {};
  for (let i = 0; i < this.rawRefs.length; i++) {
    if (this.rawRefs[i].getAttribute && !this.rawRefs[i].getAttribute('ref-id') && this.hash) {
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
  for (let i = 0; i < refs.length; i++) {
    Engine.rendering(refs[i], this.state);
  }
}
Refs.prototype.renderRawRefs = function (refs) {
  for (let i = 0; i < refs.length; i++) {
    Engine.processor(refs[i], this.state);
  }
}

module.exports = Refs;