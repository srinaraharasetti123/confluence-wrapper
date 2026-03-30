function getRecentActivity(spaceId, limit) {
  var maxItems = limit || 20;
  var q = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";

  if (spaceId) {
    var fileIds = getAllFileIdsInSpace_(spaceId);
    if (fileIds.length === 0) return [];
    q = "'" + spaceId + "' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'";
  }

  var resp = Drive.Files.list({
    q: q,
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink)',
    pageSize: maxItems,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  var files = resp.files || [];
  var registry = getSpaceRegistry();

  return files.map(function(file) {
    return {
      id: file.id,
      name: file.name || 'Untitled',
      mimeType: file.mimeType || '',
      modifiedTime: file.modifiedTime || '',
      modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
      modifiedByPhoto: (file.lastModifyingUser && file.lastModifyingUser.photoLink) || undefined,
      webViewLink: file.webViewLink || '',
      spaceName: spaceId ? (registry.find(function(s) { return s.id === spaceId; }) || {}).name : undefined
    };
  });
}

function getAllFileIdsInSpace_(spaceId) {
  var ids = [];
  var resp = Drive.Files.list({
    q: "'" + spaceId + "' in parents and trashed = false",
    fields: 'files(id)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  var files = resp.files || [];
  for (var i = 0; i < files.length; i++) {
    ids.push(files[i].id);
  }
  return ids;
}

function getCurrentUser() {
  var email = Session.getActiveUser().getEmail();
  return {
    email: email,
    name: email.split('@')[0]
  };
}
