import Obj from '../lib/obj.js';
import Ref from '../lib/ref.js';
import Directive from '../lib/directive.js';

const Refs = function (state, id) {
  this.els = [];
  const els = document.querySelectorAll(`[ref=${state.id}]`);
  for (let i = 0; i < els.length; i++) {
    this.els.push(els[i]);
  }
  for (let i = 0; i < self.state.$els.length; i++) {
    const elsChips = self.state.$els[i].querySelectorAll(`[ref=${state.id}]`);
    for (let j = 0; j < elsChips.length; j++) {
      this.els.push(elsChips[j]);
    }
  }
  this.RefState = { refs: {} };
  for (let i = 0; i < this.els.length; i++) {
    const RefState = Ref.getTraversalTemplate(this.els[i]);
    if (RefState.refs[state.id]) {
      this.RefState.refs[state.id] = this.RefState.refs[state.id] || {
        normal: [],
        special: [],
      };
      this.RefState.refs[state.id].normal = this.RefState.refs[state.id].normal.concat(RefState.refs[state.id].normal);
      this.RefState.refs[state.id].special = this.RefState.refs[state.id].special.concat(RefState.refs[state.id].special);
    }
  }
  if (!this.RefState.refs[state.id]) {
    return false;
  }
  this.id = id;
  this.state = state;
  this.Directive = Directive;
  this.rawRefs = [];
  this.rawRefsSpecial = [];
  this._selectRawTemplate();
  this._renderRawRefs(this.rawRefs.normal);
  this._renderSpecialRefs(this.rawRefs.special);
};

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
    if (this.id || this.id === 0) {
      ref.setAttribute(`lies-id-${this.id}`, '');    
    }
    const params = Obj.readAsTrimArr(attrValue.split('in'));
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

Refs.prototype._selectRawTemplate = function () {
  this.rawRefs = this.RefState.refs[this.state.id];

  for (let i = 0; i < this.els.length; i++) {
    this.els[i].removeAttribute('ref');
    if (this.id || (this.id === 0)) {
      this.els[i].setAttribute(`lies-id-${this.id}`, '');      
    }
  }
}
Refs.prototype._renderRawRefs = function (refs) {
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    switch (true) {
      case ref.nodeType == 3:
        this._renderTemplate(ref);
        break;
      default:
        if (ref.setAttribute && (this.id || this.id === 0)) {
          ref.setAttribute(`lies-id-${this.id}`, '');
        }
        this._renderNormalAttr(ref);
        this._renderEventAttr(ref);
        this._renderDirectiveAttr(ref);
        break;
    }
  }
}

Refs.prototype._renderTemplate = function (ref) {
  Ref.renderTemplate(ref, this.state);
}
Refs.prototype._renderNormalAttr = function (ref) {
  Ref.renderAttr(ref, this.state, { key: ':.*' });
}
Refs.prototype._renderEventAttr = function (ref) {
  const bindEvent = (params) => {
    const { ref, parentRef, attrKey, attrValue } = params;
    Ref.removeAttr(ref, attrKey);
    ref.addEventListener(attrKey.substring(1), (e) => {
      if (attrValue.match(/\([a-z0-9.@]+\)/)) {
        Obj.read(attrValue, this.state);
      } else {
        Obj.read(attrValue.replace('}}', '()}}'), this.state);
      }
    });
  }
  Ref.renderAttr(ref, this.state, { key: '@.*', handle: bindEvent });
}
Refs.prototype._renderDirectiveAttr = function (ref) {
  const bindDirective = (params) => {
    const {
      ref, parentRef,
      attrKey, attrValue,
      detects } = params;
    const cloneRef = ref.cloneNode(true);
    const watcher = () => {
      Directive[attrKey.substring(1)](ref, parentRef,
        attrValue, this.state, cloneRef);
    }
    for (let j = 0; j < detects.length; j++) {
      const detect = detects[j].substring(1);
      this.state.watch[detect] = Obj.readAsArr(this.state.watch[detect]);
      this.state.watch[detect].push(watcher);
    }
    watcher();
  }
  Ref.renderAttr(ref, this.state, { key: '~.*', handle: bindDirective });
}

module.exports = Refs;