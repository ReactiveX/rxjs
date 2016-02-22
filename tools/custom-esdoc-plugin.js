// Fixes ESDoc structure by moving all "add-able" operator functions
// (either prototype operator or static operator) under the Observable class.
// Looks for the "@owner" tag, then moves the thing to that owner. "@owner" is
// usually "Observable", but may be something else.
exports.onHandleTag = function onHandleTag(ev) {
  function getTagValue(tag, tagName) {
    var unknownTags = tag.unknown;
    if (!unknownTags) {
      return null;
    }
    var unknownTagsLength = unknownTags.length;
    for (var i = 0; i < unknownTagsLength; i++) {
      if (unknownTags[i].tagName === tagName) {
        return unknownTags[i].tagValue;
      }
    }
    return null;
  }

  function getLongname(name) {
    var index = ev.data.tag.findIndex(function (t) {
      return t.name === name;
    });
    if (index === -1) {
      throw new Error('Could not find longname for unknown tag named "' + name +
        '"');
    } else {
      return ev.data.tag[index].longname;
    }
  }

  var tagsLen = ev.data.tag.length;
  for (var i = 0; i < tagsLen; i++) {
    var tag = ev.data.tag[i];
    var owner = getTagValue(tag, '@owner');
    var name = getTagValue(tag, '@name');
    var isStatic = getTagValue(tag, '@static');
    if (owner) {
      var ownerLongname = getLongname(owner);
      tag.kind = 'method';
      tag.static = false;
      tag.memberof = ownerLongname;
      if (name) {
        tag.name = name;
      }
      if (isStatic) {
        tag.static = true;
      }
      delete tag.importPath;
      delete tag.importStyle;
    }
  }
};
