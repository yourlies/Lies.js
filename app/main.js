import Lies from './vendor/vm.js';
import Refs from './vendor/dom/refs.js';
import Router from './vendor/plugin/router.js';
import Transition from './vendor/plugin/transition.js';

self.state = {};
self.state.$components = {};
self.state.$els = [];
self.Lies = Lies;
self.Refs = Refs;
self.Transition = Transition;
self.transition = new Transition({ el: document.body });
self.Router = Router;