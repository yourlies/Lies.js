import Lies from './vendor/loader.js';
import Refs from './vendor/dom/refs.js';

self.Lies = Lies;
self.Refs = Refs;

// setTimeout(function () {
//   var obj = new Lies({
//     data () {
//       return {
//         title: '测试',
//         isFrontInfo: true,
//         links: ['Lies', '项目', '写真', '笔记', '友链']
//       }
//     },
//     methods: {
//       switchUserinfo: function () {
//         this.updater({ 'isFrontInfo': false });
//       },
//       switchUserlogo: function () {
//         this.updater({ 'isFrontInfo': true });
//       },
//       redirect: function () {}
//     }
//   });
//   var el = document.getElementById('app');
//   var refsObj = new Refs(el, obj);
//   var refs = refsObj.templateElCache;
// });