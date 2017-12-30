import Lies from './vendor/loader.js';
import Refs from './vendor/dom/refs.js';

self.Lies = Lies;
self.Refs = Refs;

// const obj = new Lies({
//   data () {
//     return {
//       title: '测试',
//       cu: false,
//       arr: [0, 1, 2],
//       links: ['Lies', '项目', '写真', '笔记', '友链']
//     }
//   },
//   methods: {
//     test () {
//       console.log(this);
//     },
//     fuck () {
//       console.log(123123)
//     }
//   },
//   watch: {
//     'condition.fuck' () {
      
//     }
//   }
// });
// const el = document.createElement('div');
// el.innerHTML = '<div @click="test" ~if="cu">{{ title }}</div><a ~for="a in arr" @click="fuck">asd@{{ a }}</a>';
// const refsObj = new Refs(el, obj);
// const refs = refsObj.templateElCache;
// document.body.appendChild(el);

// obj.updater({ 'cu': true });

