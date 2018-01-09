import Obj from './obj.js';
import Str from './str.js';
import Ref from './ref.js';

let markCount = 0;
const commentRefs = [];

const directives = {};
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
directives.for = function (ref, parentRef, attrValue, state, cloneRef, cloneParentRef) {
  const conditions = Obj.readAsTrimArr(attrValue.split(' in '));
  const arrKey = conditions[1];
  const arrName = conditions[0];
  const outerHTML = ref.outerHTML;
  let renderHTML = '';
  const forArr = Obj.read(conditions[1], state);
  for (let i = 0; i < forArr.length; i++) {
    const pattern = new RegExp(`~${arrName}`, 'g');
    let replace = Str.trim(arrKey, '[@.]');
    let replaceHTML = outerHTML.replace(pattern, `@${replace}.${i}`);
    replaceHTML = replaceHTML.replace(/~index/g, i);
    renderHTML += replaceHTML;
  }

  const forId = cloneRef.getAttribute('for-id');
  if (forId) {
    const pattern = new RegExp(`<!--~for-${forId}-->(.|\t|\n)*?<!--~end-for-${forId}-->`, 'i');
    parentRef.innerHTML = parentRef.innerHTML.replace(pattern, function (match) {
    return `<!--~for-${forId}-->${renderHTML}<!--~end-for-${forId}-->`;
    });
    return false;
  }

  cloneRef.setAttribute('for-id', markCount);
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
