function getTagsForFile(fileId) {
  var sheet = getTagSheet_();
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var tags = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === fileId) {
      tags.push(data[i][1]);
    }
  }

  return tags;
}

function setTagsForFile(fileId, tags) {
  var sheet = getTagSheet_();
  if (!sheet) return;

  var email = Session.getActiveUser().getEmail();
  var now = new Date().toISOString();

  // Remove existing tags for this file
  var data = sheet.getDataRange().getValues();
  var rowsToDelete = [];

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === fileId) {
      rowsToDelete.push(i + 1);
    }
  }

  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  // Add new tags
  for (var k = 0; k < tags.length; k++) {
    sheet.appendRow([fileId, tags[k].trim().toLowerCase(), email, now]);
  }
}

function addTagToFile(fileId, tag) {
  var existing = getTagsForFile(fileId);
  var normalized = tag.trim().toLowerCase();

  if (existing.includes(normalized)) return existing;

  var sheet = getTagSheet_();
  if (!sheet) return existing;

  var email = Session.getActiveUser().getEmail();
  sheet.appendRow([fileId, normalized, email, new Date().toISOString()]);

  return existing.concat([normalized]);
}

function removeTagFromFile(fileId, tag) {
  var sheet = getTagSheet_();
  if (!sheet) return [];

  var normalized = tag.trim().toLowerCase();
  var data = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === fileId && data[i][1] === normalized) {
      sheet.deleteRow(i + 1);
    }
  }

  return getTagsForFile(fileId);
}

function searchByTag(tag) {
  var sheet = getTagSheet_();
  if (!sheet) return [];

  var normalized = tag.trim().toLowerCase();
  var data = sheet.getDataRange().getValues();
  var fileIds = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === normalized && !fileIds.includes(data[i][0])) {
      fileIds.push(data[i][0]);
    }
  }

  return fileIds.map(function(id) {
    try {
      var file = Drive.Files.get(id, {
        fields: 'id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink',
        supportsAllDrives: true
      });
      return {
        id: file.id,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: 'Tagged: ' + normalized,
        modifiedTime: file.modifiedTime || '',
        modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
        webViewLink: file.webViewLink || '',
        breadcrumb: []
      };
    } catch (e) {
      return null;
    }
  }).filter(function(r) { return r !== null; });
}

function getAllTags() {
  var sheet = getTagSheet_();
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var counts = {};

  for (var i = 1; i < data.length; i++) {
    var tag = data[i][1];
    counts[tag] = (counts[tag] || 0) + 1;
  }

  return Object.entries(counts)
    .map(function(entry) { return { tag: entry[0], count: entry[1] }; })
    .sort(function(a, b) { return b.count - a.count; });
}

function getTagSheet_() {
  try {
    var sheetId = getTagSheetId();
    var ss = SpreadsheetApp.openById(sheetId);
    return ss.getSheetByName('Tags');
  } catch (e) {
    return null;
  }
}
