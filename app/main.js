import Lies from './vendor/vm.js';
import Refs from './vendor/dom/refs.js';
import Router from './vendor/plugin/router.js';
import Transition from './vendor/plugin/transition.js';
import Processor from './vendor/plugin/processor.js';

self.state = {};
self.state.$components = {};
self.state.$els = [];

Processor.install(Lies);

self.Lies = Lies;
self.Lies.createComponent = function (instance) {
  const template = instance.template;
  delete instance.template;
  const app = document.createElement('div');
  app.innerHTML = template;
  instance.id = app.childNodes[0];
  const vm = new Lies(instance);
  new Refs(vm);

  document.body.appendChild(vm.$el);

  return vm;
}
self.Refs = Refs;
self.Transition = Transition;
self.transition = new Transition({ el: document.body });
self.Router = Router;