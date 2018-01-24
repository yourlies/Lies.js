import StringProcessor from '../lib/str.js';
import ObjectProcessor from '../lib/obj.js';
import PatternProcessor from '../lib/pattern.js';
import Traverse  from '../engine/traverse.js';

const attribute = function (ref, state) {
  const attributes = [];
  const render = [];

  for (let i = 0; i < ref.attributes.length; i++) {
    attributes.push({ key: ref.attributes[i].name, value: ref.attributes[i].value })
  }
  for (let i = 0; i < attributes.length; i++) {
    if (PatternProcessor.needmarkattribute(attributes[i].key)) {
      const key = attributes[i].key;
      let value = attributes[i].value;
      value = value.replace(PatternProcessor.maps.param, function (match) {
        if (PatternProcessor.needmarkedparam(match) && key != 'i-for') {
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

const list = function (ref, state) {
  const key = ref.getAttribute('i-for-key');
  const index = ref.getAttribute('i-for-index');

  const resTarversal = Traverse.getTraversalTemplate(ref);
  resTarversal.refs.unkind.normal.push(ref);
  for (let i = 0; i < resTarversal.refs.unkind.normal.length; i++) {
    const el = resTarversal.refs.unkind.normal[i];
    if (el.nodeType == 3) {
      const res = [];
      const matches = StringProcessor.matchCloseTag('{{', '}}', el.nodeValue);
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
      el.nodeValue = res.join('');
    } else if (el.attributes) {
      const attributes = ObjectProcessor.extendArr(el.attributes);
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
}

module.exports = { attribute, updater, template, list };