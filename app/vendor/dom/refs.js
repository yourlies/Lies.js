import Obj from '../lib/obj.js';
import Ref from '../lib/ref.js';
import Directive from '../lib/directive.js';

const Refs = function (el, state) {
  this.el = el;
  this.state = state;
  this.Directive = Directive;
  this.templateElCache = [];
  this._renderList();
  this._getTemplateEl();
  this._renderTemplate();
  this._renderAttr();
};

Refs.prototype._getTemplateTraversal = function (el, elContainer) {
  if (!el || !el.childNodes) {
    return false;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    const ref = el.childNodes[i];
    if (ref.nodeType == 3 && !/\S/.test(ref.nodeValue)) {
      ref.parentNode.removeChild(ref);
      i--;
    } else {
      elContainer.push(ref);
    }
    this._getTemplateTraversal(ref, elContainer);
  }
}

Refs.prototype._parseAttr = function (rule, handle) {
  for (let i = 0; i < this.templateElCache.length; i++) {
    const ref = this.templateElCache[i];
    if (!ref.getAttribute) {
      continue;
    }
    const outerHTML = ref.outerHTML;
    const rawHTML = outerHTML.match(/<.*?>/i)[0];
    const pattern = new RegExp(`${rule}([a-z0-9]+="[a-z.0-9]+")`, 'gi');
    const events = rawHTML.match(pattern);
    if (!events) {
      continue;
    }
    for (let j = 0; j < events.length; j++) {
      const chips = events[j].split('=');
      const parentRef = ref.parentNode;
      const eventName = chips[0].match(/[a-z0-9]+/i)[0];
      const paramKey = chips[1].match(/[a-z.0-9]+/i)[0];
      const paramValue = Obj.read(paramKey, this.state);
      handle(ref, parentRef, eventName, paramValue, paramKey);
    }
  }
}

Refs.prototype._getRenderTemplateRes = function (nodeEl) {
  const res = { paramKeyArr: [], value: '', watcher: null };
  const watcher = (ref, handle) => {
    return ref.nodeValue.replace(/{{([a-z0-9. ])+}}/gi, (match) => {
      if (typeof handle == 'function') {
        const paramKey = match.replace(/{|}| /g, '');
        handle(paramKey);
      }
      const param = match.replace(/{|}| /g, '');
      return Obj.read(param, this.state);
    });
  }
  res.watcher = watcher;
  res.value = watcher(nodeEl, (paramKey) => {
    res.paramKeyArr.push(paramKey);
  })
  return res;
}

Refs.prototype._getTemplateEl = function () {
  const elContainer = [];
  this._getTemplateTraversal(this.el, elContainer);
  this.templateElCache = elContainer;
}

Refs.prototype._renderList = function () {
  const inner = this.el.innerHTML;
  this.el.innerHTML = inner.replace(/<.*([~for]{4})(.|\s)*?<\/.*?>/, (match) => {
    let findStartIndex = false;
    let startIndex = -1;
    for (let i = match.length - 1; i >= 0; i--) {
      if (findStartIndex == true && match[i] == '<') {
        startIndex = i;
        break;
      }
      if (match[i] == '~') {
        findStartIndex = true;
      }
    }
    const uncontain = match.substring(0, startIndex);
    const contain = match.substring(startIndex, match.length);
    const paramKey = contain.match(/\~for="(.*?)"/)[1].split(' in ')[1];
    const paramValue = this.state[paramKey];
    let render = '';
    for (let j = 0; j < paramValue.length; j++) {
      render += contain.replace(/{{([a-z0-9 ])+}}/gi, `{{ ${paramKey}.${j} }}`);
    }
    const inner = `${uncontain}${render}`;
    return Ref.removeAttr(inner, '~for');
  });
}

Refs.prototype._renderTemplate = function () {
  for (let i = 0; i < this.templateElCache.length; i++) {
    const ref = this.templateElCache[i];

    const refClone = ref.cloneNode(true);
    if (ref.nodeType != 3 || !ref.nodeValue.match(/{{(.*)}}/i)) {
      continue;
    }

    const res = this._getRenderTemplateRes(ref);
    ref.nodeValue = res.value;

    for (let j = 0; j < res.paramKeyArr.length; j++) {
      const watcher = Obj.readAsArr(this.state.watch[res.paramKeyArr[j]]);
      watcher.push(() => {
        ref.nodeValue = res.watcher(refClone);
      })
      this.state.watch[res.paramKeyArr[j]] = watcher;
    }
  }
}

Refs.prototype._renderAttr = function () {
  const _this = this;
  this._parseAttr('@', (ref, parentRef, eventName, eventHandle) => {
    Ref.removeAttr(ref, `@${eventName}`);
    ref.addEventListener(eventName, function () {
      eventHandle.call(_this.state);
    });
  })
  this._parseAttr('~', (ref, parentRef, eventName, paramValue, paramKey) => {
    Ref.removeAttr(ref, `~${eventName}`);
    const completeParam = true;
    const watcher = Obj.readAsArr(_this.state.watch[paramKey]);
    watcher.push(() => {
      const value = Obj.read(paramKey, _this.state);
      this.Directive[eventName](ref, parentRef, value);
    });
    _this.state.watch[paramKey] = watcher;
    this.Directive[eventName](ref, parentRef, paramValue);
  })
}

module.exports = Refs;