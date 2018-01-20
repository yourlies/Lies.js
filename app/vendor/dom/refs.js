import Obj from '../lib/obj.js';
import Ref from '../lib/ref.js';
import Directive from '../lib/directive.js';

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
// 
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
        this._renderTemplate(ref);
        break;
      default:
        this._renderNormalAttr(ref);
        this._renderEventAttr(ref);
        this._renderDirectiveAttr(ref);
        break;
    }
  }
}
// 
Refs.prototype._renderTemplate = function (ref) {
  Ref.renderTemplate(ref, this.state);
}
Refs.prototype._renderNormalAttr = function (ref) {
  Ref.renderAttr(ref, this.state, { key: ':' });
}
Refs.prototype._renderEventAttr = function (ref) {
  const bindEvent = (params) => {
    const { ref, parentRef, attrKey, attrValue } = params;
    Ref.removeAttr(ref, attrKey);
    ref.addEventListener(attrKey.substring(1), (e) => {
      setTimeout(() => {
        if (attrValue.match(/\([a-z0-9.@]+\)/)) {
          Obj.read(attrValue, this.state);
        } else {
          this.state.$events = this.state.$events || {};
          this.state.$events.e = e;
          Obj.read(attrValue.replace('}}', '(@$events.e)}}'), this.state);
        }
      })
    });
  }
  Ref.renderAttr(ref, this.state, { key: '@', handle: bindEvent });
}
Refs.prototype._renderDirectiveAttr = function (ref) {
  const map = {
    'if': true,
    'focus': true,
  }
  const bindDirective = (params) => {
    const {
      ref, parentRef,
      attrKey, attrValue,
      detects } = params;
    const cloneRef = ref.cloneNode(true);
    const watcher = () => {
      const needWatch = Directive[attrKey.substring(1)](ref, parentRef,
        attrValue, this.state, cloneRef);
      return needWatch;
    }
    watcher();
    if (map[attrKey.substring(1)]) {
      for (let j = 0; j < detects.length; j++) {
        const detect = detects[j].substring(1);
        this.state.watch[detect] = Obj.readAsArr(this.state.watch[detect]);
        this.state.watch[detect].push(watcher);
      }
    }
  }
  Ref.renderAttr(ref, this.state, { key: '~', handle: bindDirective });
}

module.exports = Refs;