function getPageTree(folderId, depth) {
  var nodes = [];
  fetchChildren_(folderId, depth, nodes);
  return nodes;
}

function fetchChildren_(parentId, depth, results) {
  if (depth <= 0) return;

  var pageToken;
  do {
    var resp = Drive.Files.list({
      q: "'" + parentId + "' in parents and trashed = false",
      orderBy: 'folder,name',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink,iconLink)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    var files = resp.files || [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      var hasChildren = false;

      if (isFolder) {
        var childCheck = Drive.Files.list({
          q: "'" + file.id + "' in parents and trashed = false",
          fields: 'files(id)',
          pageSize: 1,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        hasChildren = !!(childCheck.files && childCheck.files.length > 0);
      }

      var node = {
        id: file.id,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        parentId: parentId,
        modifiedTime: file.modifiedTime || '',
        modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
        hasChildren: hasChildren,
        webViewLink: file.webViewLink || '',
        iconLink: file.iconLink || ''
      };

      results.push(node);

      if (isFolder && depth > 1) {
        fetchChildren_(file.id, depth - 1, results);
      }
    }

    pageToken = resp.nextPageToken || undefined;
  } while (pageToken);
}

function getPageMeta(fileId) {
  var file = Drive.Files.get(fileId, {
    fields: 'id,name,mimeType,description,modifiedTime,lastModifyingUser,createdTime,webViewLink,thumbnailLink,parents',
    supportsAllDrives: true
  });

  var breadcrumb = buildBreadcrumb_(fileId);
  var tags = getTagsForFile(fileId);
  var starred = isFavorite_(fileId);

  return {
    id: file.id,
    name: file.name || 'Untitled',
    mimeType: file.mimeType || '',
    description: file.description || '',
    modifiedTime: file.modifiedTime || '',
    modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
    createdTime: file.createdTime || '',
    webViewLink: file.webViewLink || '',
    thumbnailLink: file.thumbnailLink || undefined,
    breadcrumb: breadcrumb,
    tags: tags,
    starred: starred
  };
}

function getFolderInfo(folderId) {
  var file = Drive.Files.get(folderId, {
    fields: 'id,name,description,modifiedTime,lastModifyingUser,createdTime,webViewLink,parents',
    supportsAllDrives: true
  });

  var breadcrumb = buildBreadcrumb_(folderId);

  return {
    id: file.id,
    name: file.name || 'Untitled',
    description: file.description || '',
    modifiedTime: file.modifiedTime || '',
    modifiedBy: (file.lastModifyingUser && file.lastModifyingUser.displayName) || 'Unknown',
    createdTime: file.createdTime || '',
    webViewLink: file.webViewLink || '',
    breadcrumb: breadcrumb
  };
}

function getFullPageTree(folderId) {
  var nodes = [];
  fetchChildren_(folderId, 10, nodes);
  return nodes;
}

function buildBreadcrumb_(fileId) {
  var crumbs = [];
  var currentId = fileId;
  var maxDepth = 10;

  for (var i = 0; i < maxDepth; i++) {
    try {
      var file = Drive.Files.get(currentId, {
        fields: 'id,name,parents',
        supportsAllDrives: true
      });

      if (i > 0) {
        crumbs.unshift({ id: file.id, name: file.name || 'Untitled' });
      }

      if (!file.parents || file.parents.length === 0) break;
      currentId = file.parents[0];
    } catch (e) {
      break;
    }
  }

  return crumbs;
}
