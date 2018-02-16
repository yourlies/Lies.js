const maps = {
  param: new RegExp('([@0-9.a-z]+)|(\'(.*?)\')|("(.*?)")', 'gi'),
  funcwithparam: new RegExp('[a-z0-9.@]+\\(.*?\\)', 'i'),
}

const needmarkedparam = function (input) {
  if (input.match(/'[0-9.a-z]+'/i)
    || input.match(/"[0-9.a-z]+"/i)
    || input.match(/[']+/)
    || input.match(/["]+/)
    || input == 'true'
    || input == 'false'
    || input == 'typeof'
    || input[0] == '@'
    || input[0] == '~'
    || !isNaN(input)) {
    return false;
  } else {
    return true;
  }
}

const needmarkattribute = function (input) {
  const prefix = input.substring(0, 2);
  if (input.substring(0, 5) == 'i-for') {
    return false;
  }
  return prefix == 'i-' || prefix == 'e-' || prefix == 'r-';
}

module.exports = { needmarkedparam, needmarkattribute, maps };