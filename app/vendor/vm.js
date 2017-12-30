import Variable from './variable.js';
import Closure from './closure.js';
import Obj from './lib/obj.js';

const Vm = function (instance = {}) {
  instance.watch = instance.watch || {};
  this._data = instance.data || {};
  this._methods = instance.methods || {};
  delete instance.data;
  delete instance.methods;
  Obj.copy(this._data(), this);
  Obj.copy(this._methods, this);
  Variable.call(this, instance);
}
Vm.prototype = new Variable;

module.exports = Vm;