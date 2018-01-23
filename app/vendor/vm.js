import Obj from './lib/obj.js';

const Vm = function (instance = {}) {
  instance.watch = instance.watch || {};
  this._data = instance.data || {};
  this._methods = instance.methods || {};
  delete instance.data;
  delete instance.methods;
  Obj.copy(this._data(), this);
  Obj.copy(this._methods, this);
  Obj.copy(instance, this);
}
Vm.prototype.updater = function (obj) {
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

module.exports = Vm;