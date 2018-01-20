const Str = {};

Str.trim = function (str, remove) {
  return this.ltrim(this.rtrim(str, remove), remove);
}
Str.ltrim = function (str, remove) {
  const pattern = new RegExp(remove);
  const replace = (str[0] || '').replace(pattern, '');
  return `${replace}${str.substring(1, str.length)}`;
}
Str.rtrim = function (str, remove) {
  const pattern = new RegExp(remove);
  const replace = (str[str.length - 1] || '').replace(pattern, '');
  return `${str.substring(0, str.length - 1)}${replace}`;
}
Str.matchCloseTag = function (start, end, str) {
  const matches = str.split(end);
  if (matches.length <= 1) {
    return [{ isClose: false, str }];
  }
  const res = [];
  for (let i = 0; i < matches.length - 1; i++) {
    const match = `${matches[i]}${end}`.trim();
    const startIndex = match.lastIndexOf(start);
    if (startIndex === 0) {
      res.push({
        isClose: true,
        str: match.substring(startIndex + start.length, match.length - end.length)
      });
    } else if (startIndex !== -1) {
      res.push({ isClose: false, str: match.substring(0, startIndex) });
      res.push({
        isClose: true,
        str: match.substring(startIndex + start.length, match.length - end.length)
      });
    } else {
      res.push({ isClose: false, str: match });
    }
  }
  res.push({ isClose: false, str: matches[matches.length - 1] });
  return res;
}

module.exports = Str;