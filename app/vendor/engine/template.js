import ObjectProcessor from '../lib/obj.js';
import StringProcessor from '../lib/str.js';

const Template = {};

Template.detect = function (input) {
  const output = [];
  const result = StringProcessor.matchCloseTag('{{', '}}', input);
  for (let i = 0; i < result.length; i++) {
    if (!result[i].isClose) {
      continue;
    } else {
      const matches = result[i].str.match(/@([a-z0-9.]+)/gi) || [];
      for (let j = 0; j < matches.length; j++) {
        output.push(matches[j]);
      }
    }
  }
  return { result, output };
}

Template.worker = function ({ attribute, state, processor, ref }) {
  const { name, value } = attribute;
  if (!processor.matcher(name)) {
    return false;
  }
  const template = `{{${value}}}`;
  const { output } = Template.detect(template);
  processor.compiler({ name, value, detect: output, ref, state });
}

Template.render = function (ref, state) {
  const detect = Template.detect(ref.nodeValue);
  const cloneRef = ref.cloneNode(true);
  const watcher = function () {
    const renderRes = [];
    for (let i = 0; i < detect.result.length; i++) {
      if (detect.result[i].isClose) {
        renderRes.push(ObjectProcessor.read(detect.result[i].str, state));
      } else {
        renderRes.push(detect.result[i].str);
      }
    }
    ref.nodeValue = renderRes.join('');
  }

  for (let i = 0; i < detect.output.length; i++) {
    const de = detect.output[i].substring(1);
    state.watch[de] = ObjectProcessor.readAsArr(state.watch[de]);
    state.watch[de].push(watcher);
  }

  watcher();
}

module.exports = Template;