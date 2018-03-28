import Obj from './obj.js';
import Str from './str.js';

const Tool = {};
Tool.commentRefs = [];
Tool.commentsFor = [];

const directives = {};
directives.focus = function (ref) {
  ref.focus();
}
directives.show = function ({ ref, parentRef, value, state }) {
  const renderValue = Obj.read(value, state);
  if (renderValue) {
    ref.style.display = '';
  } else {
    ref.style.display = 'none';
  }
}
directives.if = function ({ ref, parentRef, value, state, cloneRef }) {
  let ifId = cloneRef.getAttribute('if-id');
  let commentRef = '';
  if (ifId) {
    commentRef = Tool.commentRefs[ifId];
  } else {
    self.state.$els.push(ref);
    commentRef = document.createComment('<--if-->');
    cloneRef.setAttribute('if-id', Tool.commentRefs.length);
    ifId = Tool.commentRefs.length;
    Tool.commentRefs.push(commentRef);
  }
  const renderValue = Obj.read(value, state);
  if (!renderValue) {
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
  const forKey = cloneRef.getAttribute('i-for-key');
  const forName = cloneRef.getAttribute('i-for-name');
  const forIndex = cloneRef.getAttribute('i-for-index');

  const outerHTML = ref.outerHTML;
  let renderHTML = '';
  const forArr = Obj.read(`@${forName}`, state);

  const renderArr = [];

  for (let i = 0; i < forArr.length; i++) {
    const pattern = new RegExp(`\\(##${forKey}##\\)`, 'g');
    let replace = Str.trim(forName, '[@.]');
    let replaceHTML = outerHTML.replace(pattern, `@${replace}.${i}`);

    const tPattern = new RegExp(`\\(##${forIndex}##\\)`, 'g');

    replaceHTML = replaceHTML.replace(tPattern, i);

    const container = document.createElement('div');
    container.innerHTML = replaceHTML;
    renderArr.push(container.childNodes[0]);
    renderHTML += replaceHTML;
  }

  const forId = cloneRef.getAttribute('i-for-id');
  if (forId) {
    const removeArr = Tool.commentsFor[forId].renderArr;
    const removeEnd = Tool.commentsFor[forId].end;
    for (let i = 0; i < removeArr.length; i++) {
      removeArr[i].parentNode.removeChild(removeArr[i]);
    }
    for (let i = 0; i < renderArr.length; i++) {
      parentRef.insertBefore(renderArr[i], removeEnd);
    }
    Tool.commentsFor[forId].renderArr = renderArr;
    return false;
  }

  const start = document.createComment('for');
  const end = document.createComment('end-for');

  const id = Tool.commentsFor.push({ start, end, renderArr }) - 1;
  cloneRef.setAttribute('i-for-id', id);

  parentRef.insertBefore(start, ref);
  if (!ref.nextSibling) {
    parentRef.appendChild(end);
  } else {
    parentRef.insertBefore(end, ref.nextSibling);
  }
  ref.parentNode.removeChild(ref);
  for (let i = 0; i < renderArr.length; i++) {
    parentRef.insertBefore(renderArr[i], end);
  }
}

module.exports = directives;
