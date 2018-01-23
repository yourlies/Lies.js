import ObjProcessor from './lib/obj.js';
import Expand from './expand/index.js';

const Vm = function (instance = {}) {
  instance.watch = instance.watch || {};
  this._data = instance.data || {};
  this._methods = instance.methods || {};
  delete instance.data;
  delete instance.methods;

  const data = {};
  ObjProcessor.copy(this._data(), data);
  this.$data = data;
  ObjProcessor.copy(this._methods, this);
  ObjProcessor.copy(instance, this);

  Expand.updater(this);
}
Vm.prototype.updater = function (obj, force) {
  for (var key in obj) {
    const oldVal = ObjProcessor.read(key, this);
    const newVal = obj[key];
    const watcher = ObjProcessor.readAsArr(this.watch[key]);
    if (newVal == oldVal && !force) {
      continue;
    }
    ObjProcessor.store(key, this, obj[key]);
    this.watch[key] = watcher;
    for (let i = 0; i < watcher.length; i++) {
      watcher[i].call(this, newVal, oldVal);
    }
  }
}

module.exports = Vm;