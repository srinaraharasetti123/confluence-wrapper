function getRecentActivity(spaceId?: string, limit?: number): ActivityItem[] {
  const maxItems = limit || 20;
  let q = 'trashed = false and mimeType != \'application/vnd.google-apps.folder\'';

  if (spaceId) {
    const fileIds = getAllFileIdsInSpace_(spaceId);
    if (fileIds.length === 0) return [];
    // Drive API doesn't support "id in (...)" so we search by parent for immediate children
    q = `'${spaceId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
  }

  const resp = Drive.Files!.list({
    q,
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink)',
    pageSize: maxItems,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  const files = resp.files || [];
  const registry = getSpaceRegistry();

  return files.map(file => ({
    id: file.id!,
    name: file.name || 'Untitled',
    mimeType: file.mimeType || '',
    modifiedTime: file.modifiedTime || '',
    modifiedBy: file.lastModifyingUser?.displayName || 'Unknown',
    modifiedByPhoto: file.lastModifyingUser?.photoLink || undefined,
    webViewLink: file.webViewLink || '',
    spaceName: spaceId ? registry.find(s => s.id === spaceId)?.name : undefined
  }));
}

function getAllFileIdsInSpace_(spaceId: string): string[] {
  const ids: string[] = [];
  const resp = Drive.Files!.list({
    q: `'${spaceId}' in parents and trashed = false`,
    fields: 'files(id)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  for (const file of (resp.files || [])) {
    ids.push(file.id!);
  }
  return ids;
}

function getCurrentUser(): { email: string; name: string } {
  const email = Session.getActiveUser().getEmail();
  return {
    email,
    name: email.split('@')[0]
  };
}
