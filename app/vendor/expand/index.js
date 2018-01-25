import StringProcessor from '../lib/str.js';
import ObjectProcessor from '../lib/obj.js';
import PatternProcessor from '../lib/pattern.js';
import Traverse  from '../engine/traverse.js';

const attribute = function (attribute, state) {
  if (PatternProcessor.needmarkattribute(attribute.name)) {
    const { name, value } = attribute;
    const markedValue = value.replace(PatternProcessor.maps.param, function (match) {
      if (PatternProcessor.needmarkedparam(match)) {
        return `@${match}`;
      } else {
        return match;
      }
    });
    attribute.value = markedValue;
  }
}

const updater = function (state) {
  for (let key in state.$data) {
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

const list = function ({ ref, state, index, key }) {
  if (ref.nodeType == 3) {
    const res = [];
    const matches = StringProcessor.matchCloseTag('{{', '}}', ref.nodeValue);
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].isClose) {
        matches[i].str = '{{' + (matches[i].str.replace(PatternProcessor.maps.param,
          function (match) {
            if (!PatternProcessor.needmarkedparam(match)) {
              return match;
            }
            const meta = match.match(/[0-9a-z]+/i);
            if (meta[0] == key || meta[0] == index) {
              return `(##${meta[0]}##)${match.substring(meta[0].length)}`;
            } else {
              return `@${match}`;
            }
          }
        )) + '}}';
      }
      res.push(matches[i].str);
    }
    ref.nodeValue = res.join('');
  } else if (ref.attributes) {
      const attributes = ObjectProcessor.extendArr(ref.attributes);
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (PatternProcessor.needmarkattribute(attribute.name)) {
          let value = attribute.value;
          value = value.replace(PatternProcessor.maps.param, function (match) {
            if (!PatternProcessor.needmarkedparam(match)) {
              return match;
            }
            const meta = match.match(/[0-9a-z]+/i);
            if (meta[0] == key || meta[0] == index) {
              return `(##${meta[0]}##)${match.substring(meta[0].length)}`;
            } else {
              return `@${match}`;
            }
          });
          attribute.value = value;
        }
      }
  }
}

module.exports = { attribute, updater, template, list };