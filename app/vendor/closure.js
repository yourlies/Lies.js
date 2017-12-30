import Obj from './lib/obj.js';

const Closure = function (instance) {
  Obj.copy(instance, this);
}

module.exports = Closure;