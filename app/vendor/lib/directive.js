const directives = {};
directives.if = function (ref, parentRef, param) {
  if (!param) {
    parentRef.removeChild(ref);
    return false;
  }
  parentRef.appendChild(ref);
}

module.exports = directives;
