const Str = {};

Str.trim = function (str, remove) {
  return this.ltrim(this.rtrim(str, remove), remove);
}
Str.ltrim = function (str, remove) {
  if (str[0] == remove) {
    return str.substring(1);
  } else {
    return str;
  }
}
Str.rtrim = function (str, remove) {
  if (str[str.length - 1] == remove) {
    return str.substring(0, str.length - 1);
  } else {
    return str;
  }
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