function getPageTree(folderId: string, depth: number): PageNode[] {
  const nodes: PageNode[] = [];
  fetchChildren_(folderId, depth, nodes);
  return nodes;
}

function fetchChildren_(parentId: string, depth: number, results: PageNode[]): void {
  if (depth <= 0) return;

  let pageToken: string | undefined;
  do {
    const resp = Drive.Files!.list({
      q: `'${parentId}' in parents and trashed = false`,
      orderBy: 'folder,name',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink,iconLink)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    const files = resp.files || [];
    for (const file of files) {
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      let hasChildren = false;

      if (isFolder) {
        const childCheck = Drive.Files!.list({
          q: `'${file.id}' in parents and trashed = false`,
          fields: 'files(id)',
          pageSize: 1,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        hasChildren = !!(childCheck.files && childCheck.files.length > 0);
      }

      const node: PageNode = {
        id: file.id!,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        parentId: parentId,
        modifiedTime: file.modifiedTime || '',
        modifiedBy: file.lastModifyingUser?.displayName || 'Unknown',
        hasChildren: hasChildren,
        webViewLink: file.webViewLink || '',
        iconLink: file.iconLink || ''
      };

      results.push(node);

      if (isFolder && depth > 1) {
        fetchChildren_(file.id!, depth - 1, results);
      }
    }

    pageToken = resp.nextPageToken || undefined;
  } while (pageToken);
}

function getPageMeta(fileId: string): PageDetail {
  const file = Drive.Files!.get(fileId, {
    fields: 'id,name,mimeType,description,modifiedTime,lastModifyingUser,createdTime,webViewLink,thumbnailLink,parents',
    supportsAllDrives: true
  });

  const breadcrumb = buildBreadcrumb_(fileId);
  const tags = getTagsForFile(fileId);
  const starred = isFavorite_(fileId);

  return {
    id: file.id!,
    name: file.name || 'Untitled',
    mimeType: file.mimeType || '',
    description: file.description || '',
    modifiedTime: file.modifiedTime || '',
    modifiedBy: file.lastModifyingUser?.displayName || 'Unknown',
    createdTime: file.createdTime || '',
    webViewLink: file.webViewLink || '',
    thumbnailLink: file.thumbnailLink || undefined,
    breadcrumb,
    tags,
    starred
  };
}

function buildBreadcrumb_(fileId: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [];
  let currentId = fileId;
  const maxDepth = 10;

  for (let i = 0; i < maxDepth; i++) {
    try {
      const file = Drive.Files!.get(currentId, {
        fields: 'id,name,parents',
        supportsAllDrives: true
      });

      if (i > 0) {
        crumbs.unshift({ id: file.id!, name: file.name || 'Untitled' });
      }

      if (!file.parents || file.parents.length === 0) break;
      currentId = file.parents[0];
    } catch (e) {
      break;
    }
  }

  return crumbs;
}
