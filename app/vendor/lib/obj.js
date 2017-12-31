const Obj = {};
Obj.read = function (param, state, isEval) {
  const needEval = isEval || !param.match(/^[a-z0-9.]/);
  if (needEval) {
    const key = param.replace(/@/g, 'state.');
    return eval(`${key}`);
  }

  const chips = param.split('.');
  if (chips.length > 1) {
    let res = state;
    for (let i = 0; i < chips.length; i++) {
      res = res[chips[i]];
    }
    return res;
  }
  return state[param];
}
Obj.store = function (param, state, val) {
  const chips = param.split('.');
  let inner = '';
  if (chips.length > 1) {
    for (let i = 0; i < chips.length; i++) {
      inner += `['${chips[i]}']`;
    }
    eval(`state${inner} = val`);
    return false;
  }
  state[param] = val;
}
Obj.copy = function (obj, objCopy) {
  for (let pro in obj) {
    objCopy[pro] = obj[pro];
  }
}
Obj.readAsArr = function (raw) {
  switch (typeof raw) {
    case 'function':
      return [raw];
    case 'string':
      return [raw];
    default:
      return raw || [];
  }
}
module.exports = Obj;