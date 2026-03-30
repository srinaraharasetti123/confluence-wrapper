function searchPages(query: string, spaceId?: string): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const sanitized = query.replace(/'/g, "\\'");
  let q = `fullText contains '${sanitized}' and trashed = false`;

  if (spaceId) {
    q = `'${spaceId}' in parents and ${q}`;
  }

  const results: SearchResult[] = [];
  let pageToken: string | undefined;
  const maxResults = 50;

  do {
    const resp = Drive.Files!.list({
      q,
      orderBy: 'relevance',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink,parents)',
      pageSize: Math.min(maxResults - results.length, 100),
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    const files = resp.files || [];
    for (const file of files) {
      if (results.length >= maxResults) break;

      let breadcrumb: BreadcrumbItem[] = [];
      try {
        breadcrumb = buildBreadcrumb_(file.id!);
      } catch (e) {
        // skip breadcrumb on error
      }

      results.push({
        id: file.id!,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: '',
        modifiedTime: file.modifiedTime || '',
        modifiedBy: file.lastModifyingUser?.displayName || 'Unknown',
        webViewLink: file.webViewLink || '',
        breadcrumb
      });
    }

    pageToken = resp.nextPageToken || undefined;
  } while (pageToken && results.length < maxResults);

  return results;
}
