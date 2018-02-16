const Register = {};

const processor = function (Lies) {
  Lies.prototype.$register = function (event) {
    const _this = this;
    Register[event] = {};
    return {
      then (func) {
        Register[event].handle = () => {
          func.call(_this, _this);
        };
      }
    }
  }
  Lies.prototype.$request = function (event) {
    Register[event].handle();
  }
};

module.exports = { install: processor }
