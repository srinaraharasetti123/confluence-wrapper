function searchPages(query, spaceId) {
  if (!query || query.trim().length === 0) return [];

  var sanitized = query.replace(/'/g, "\\'");
  var maxResults = 50;
  var seenIds = {};
  var results = [];

  // Query 1: fullText search (finds docs by content and name, but not reliable for folders)
  var q1 = "fullText contains '" + sanitized + "' and trashed = false";
  if (spaceId) {
    q1 = "'" + spaceId + "' in parents and " + q1;
  }
  collectResults_(q1, maxResults, results, seenIds);

  // Query 2: explicit folder name search
  var q2 = "mimeType = 'application/vnd.google-apps.folder' and name contains '" + sanitized + "' and trashed = false";
  if (spaceId) {
    q2 = "'" + spaceId + "' in parents and " + q2;
  }
  collectResults_(q2, maxResults - results.length, results, seenIds);

  return results;
}

function collectResults_(query, limit, results, seenIds) {
  if (limit <= 0) return;

  var pageToken;
  do {
    var resp = Drive.Files.list({
      q: query,
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink,parents)',
      pageSize: Math.min(limit, 100),
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    var files = resp.files || [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (seenIds[file.id]) continue;
      if (results.length >= limit) return;

      seenIds[file.id] = true;

      var breadcrumb = [];
      try {
        breadcrumb = buildBreadcrumb_(file.id);
      } catch (e) {
        // skip breadcrumb on error
      }

      results.push({
        id: file.id,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: '',
        modifiedTime: file.modifiedTime || '',
        modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
        webViewLink: file.webViewLink || '',
        breadcrumb: breadcrumb
      });
    }

    pageToken = resp.nextPageToken || undefined;
  } while (pageToken && results.length < limit);
}
