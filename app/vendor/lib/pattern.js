const maps = {
  param: new RegExp('[@0-9.a-z\'"]+', 'g'),
}

const needmarkedparam = function (input) {
  if (input.match(/'[0-9.a-z]+'/)
    || input.match(/"[0-9.a-z]+"/)
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
  return input.key[0] == '~' || input.key[0] == '@' || input.key[0] == ':';
}

module.exports = { needmarkedparam, needmarkattribute, maps };