import Obj from './obj.js';
import Str from './str.js';

let markCount = 0;
const commentRefs = [];

const directives = {};
directives.focus = function (ref) {
  ref.focus();
}
directives.if = function (ref, parentRef, attrValue, state, cloneRef) {
  let ifId = cloneRef.getAttribute('if-id');
  let commentRef = '';
  if (ifId) {
    commentRef = commentRefs[ifId];
  } else {
    self.state.$els.push(ref);
    commentRef = document.createComment('<--~if-->');
    cloneRef.setAttribute('if-id', commentRefs.length);
    ifId = commentRefs.length;
    commentRefs.push(commentRef);
  }


  ref.removeAttribute('~if');
  const value = Obj.read(attrValue, state);
  if (!value) {
    parentRef.replaceChild(commentRef, ref);
    return false;
  } else {
    if (!parentRef.contains(ref)) {
      parentRef.replaceChild(ref, commentRef);
    }
  }
}
directives.prevent = function (ref) {
  ref.removeAttribute('~prevent');
  ref.onclick = function (e) {
    e.preventDefault();
  }
  ref.ontouchstart = function (e) {
    e.preventDefault();
  }
  ref.ontouchend = function (e) {
    e.preventDefault();
  }
  ref.ontouchmove = function (e) {
    e.preventDefault();
  }
}
directives.fadebg = function (ref, parentRef, attrValue, state) {
  ref.removeAttribute('~fadebg')
  const value = Obj.read(attrValue, state);
  setTimeout(() => {
    ref.style.backgroundImage = `url(${value})`;
  })
}
directives.model = function (ref, parentRef, attrValue, state) {
  const value = ref.getAttribute('~model').substring(1);
  ref.value = Obj.read(attrValue, state);
  ref.removeAttribute('~model');
  ref.addEventListener('input', function () {
    state[value] = ref.value;
  });
  state.watch[value] = Obj.readAsArr(state.watch[value]);
  state.watch[value].push(() => {
    ref.value = Obj.read(attrValue, state);
  })
}
directives.fade = function (ref, parentRef, attrValue, state) {
  const value = ref.getAttribute('~fade');
  ref.style.display = 'none';
  ref.removeAttribute('~fade');
  const cache = document.createElement('img');
  setTimeout(() => {
    cache.src = value;
  });
  let dis = 40;
  let rafId;
  const raf = function () {
    dis--;
    ref.style.marginTop = `${dis}px`;
    rafId = requestAnimationFrame(raf);
    if (dis <= 0) {
      cancelAnimationFrame(rafId);
      if (state.fadeCallback) {
        state.fadeCallback();
      }
    }
  }
  cache.onload = function () {
    ref.style.display = '';
    ref.style.backgroundImage = `url(${value})`;
    rafId = requestAnimationFrame(raf);
  }
}
directives.for = function (ref, parentRef, cloneRef, cloneParentRef, state) {
  const forKey = ref.getAttribute('i-for-key');
  const forName = ref.getAttribute('i-for-name');
  const forIndex = ref.getAttribute('i-for-index');

  ref.removeAttribute('i-for-key');
  ref.removeAttribute('i-for-index');
  ref.removeAttribute('i-for-name');

  const outerHTML = ref.outerHTML;
  let renderHTML = '';
  const forArr = Obj.read(forName, state);


  for (let i = 0; i < forArr.length; i++) {
    const pattern = new RegExp(`\\(##${forKey}##\\)`, 'g');
    let replace = Str.trim(forName, '[@.]');
    let replaceHTML = outerHTML.replace(pattern, `@${replace}.${i}`);

    const tPattern = new RegExp(`\\(##${forIndex}##\\)`, 'g');

    replaceHTML = replaceHTML.replace(tPattern, i);
    renderHTML += replaceHTML;
  }

  const forId = cloneRef.getAttribute('m-for-id');
  if (forId) {
    const pattern = new RegExp(`<!--~for-${forId}-->(.|\t|\n)*?<!--~end-for-${forId}-->`, 'i');
    parentRef.innerHTML = parentRef.innerHTML.replace(pattern, function (match) {
    return `<!--~for-${forId}-->${renderHTML}<!--~end-for-${forId}-->`;
    });
    return false;
  }

  cloneRef.setAttribute('m-for-id', markCount);
  const startMark = document.createComment(`~for-${markCount}`);
  const endMark = document.createComment(`~end-for-${markCount}`);
  parentRef.insertBefore(startMark, ref);
  if (!ref.nextSibling) {
    parentRef.appendChild(endMark);
  } else {
    parentRef.insertBefore(endMark, ref.nextSibling);
  }
  const pattern = new RegExp(`<!--~for-${markCount}-->(.|\t|\n)*?<!--~end-for-${markCount}-->`, 'i');
  parentRef.innerHTML = parentRef.innerHTML.replace(pattern, function (match) {
    return `<!--~for-${markCount}-->${renderHTML}<!--~end-for-${markCount}-->`;
  });
  markCount++;
}

module.exports = directives;
