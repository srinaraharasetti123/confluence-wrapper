function getSpaces(): SpaceSummary[] {
  const registry = getSpaceRegistry();
  return registry.map(space => {
    const summary: SpaceSummary = {
      id: space.id,
      name: space.name,
      description: space.description || '',
      type: space.type
    };

    try {
      if (space.type === 'shared_drive') {
        const drive = Drive.Drives!.get(space.id);
        summary.name = drive.name || space.name;
      }

      const resp = Drive.Files!.list({
        q: `'${space.id}' in parents and trashed = false`,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'files(id)',
        pageSize: 1000
      });
      summary.docCount = resp.files ? resp.files.length : 0;
    } catch (e) {
      summary.docCount = 0;
    }

    return summary;
  });
}

function getSpace(spaceId: string): SpaceDetail {
  const registry = getSpaceRegistry();
  const config = registry.find(s => s.id === spaceId);

  let name = 'Unknown Space';
  let description = '';
  let type: 'shared_drive' | 'folder' = 'folder';

  if (config) {
    name = config.name;
    description = config.description || '';
    type = config.type;
  } else {
    try {
      const file = Drive.Files!.get(spaceId, {
        supportsAllDrives: true,
        fields: 'name,description'
      });
      name = file.name || name;
      description = file.description || '';
    } catch (e) {
      // fallback to defaults
    }
  }

  const items = getPageTree(spaceId, 1);

  return {
    id: spaceId,
    name,
    description,
    type,
    items
  };
}
