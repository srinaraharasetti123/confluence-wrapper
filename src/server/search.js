function searchPages(query, spaceId) {
  if (!query || query.trim().length === 0) return [];

  var sanitized = query.replace(/'/g, "\\'");
  var q = "fullText contains '" + sanitized + "' and trashed = false";

  if (spaceId) {
    q = "'" + spaceId + "' in parents and " + q;
  }

  var results = [];
  var pageToken;
  var maxResults = 50;

  do {
    var resp = Drive.Files.list({
      q: q,
      orderBy: 'relevance',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink,parents)',
      pageSize: Math.min(maxResults - results.length, 100),
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    var files = resp.files || [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (results.length >= maxResults) break;

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
  } while (pageToken && results.length < maxResults);

  return results;
}
