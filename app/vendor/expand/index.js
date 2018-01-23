import StringProcessor from '../lib/str.js';
import ObjectProcessor from '../lib/obj.js';
import Traverse  from '../engine/traverse.js';
import PatternProcessor from '../lib/pattern.js';

const attribute = function (ref, state) {
  const attributes = [];
  const render = [];

  for (let i = 0; i < ref.attributes.length; i++) {
    attributes.push({ key: ref.attributes[i].name, value: ref.attributes[i].value })
  }
  for (let i = 0; i < attributes.length; i++) {
    if (PatternProcessor.needmarkattribute(attributes[i])) {
      const key = attributes[i].key;
      let value = attributes[i].value;
      value = value.replace(PatternProcessor.maps.param, function (match) {
        if (PatternProcessor.needmarkedparam(match)) {
          return `@${match}`;
        } else {
          return match;
        }
      });
      ref.attributes[key].value = value;
    }
  }
}

const updater = function (state) {
  for (var key in state.$data) {
    Object.defineProperty(state, key, {
      get : function () {
        return state.$data[key];
      },
      set: function (val) {
        if (state.$data[key] != val) {
          state.$data[key] = val;
          const force = true;
          state.updater({ [key]: val }, force);
        }        
      }
    })
  }
}

const template = function (ref, state) {
  const value = ref.nodeValue;
  const matches = StringProcessor.matchCloseTag('{{', '}}', value);
  const render = [];
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].isClose) {
      matches[i].str = '{{' + (matches[i].str.replace(PatternProcessor.maps.param,
        function (match) {
          if (PatternProcessor.needmarkedparam(match)) {
            return `@${match}`;
          } else {
            return match;
          }
      })) + '}}';
    }
    render.push(matches[i].str);
  }
  ref.nodeValue = render.join('');
}

const list = function (ref, state) {
  const params = ref.getAttribute('~for');
  const res = Traverse.getTraversalTemplate(ref);
  for (let i = 0; i < res.refs.unkind.special.length; i++) {
    const el = res.refs.unkind.special[i];
    if (el.nodeType == 3) {
      const render = [];
      const matches = StringProcessor.matchCloseTag('{{', '}}', el.nodeValue);
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].isClose) {
          matches[i].str = '{{' + (matches[i].str.replace(PatternProcessor.maps.param,
            function (match) {
              if (!PatternProcessor.needmarkedparam(match)) {
                return match;
              }
              if (match == params[0]) {
                return `~${match}`;
              } else {
                return `@${match}`;
              }
            }
          )) + '}}';
        }
        render.push(matches[i].str);
      }
      el.nodeValue = render.join('');
    } else if (el.attributes) {
      const attributes = ObjectProcessor.extendArr(el.attributes);
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (PatternProcessor.needmarkattribute) {
          let value = attr.value;
          value = value.replace(/[@0-9.a-z'"]+/g, function (match) {
            if (!PatternProcessor.needmarkedparam(match)) {
              return match;
            }
            if (match == params[0]) {
              return `~${match}`;
            } else {
              return `@${match}`;
            }
          });
          attr.value = value;
        }
      }
    }
  }
}

module.exports = { attribute, updater, template, list };