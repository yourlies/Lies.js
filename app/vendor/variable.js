import Closure from './closure.js';
import Obj from './lib/obj.js';

const Variable = function (instance = {}) {
  Closure.call(this, instance);
}

Variable.prototype = new Closure;
Variable.prototype.updater = function (obj) {
  for (var key in obj) {
    const oldVal = Obj.read(key, this);
    const newVal = obj[key];
    const watcher = Obj.readAsArr(this.watch[key]);
    if (newVal == oldVal) {
      continue;
    }
    Obj.store(key, this, obj[key]);
    this.watch[key] = watcher;
    for (let i = 0; i < watcher.length; i++) {
      watcher[i].call(this, newVal, oldVal);
    }
  }
}

module.exports = Variable;