function getSpaces() {
  var registry = getSpaceRegistry();
  return registry.map(function(space) {
    var summary = {
      id: space.id,
      name: space.name,
      description: space.description || '',
      type: space.type
    };

    try {
      if (space.type === 'shared_drive') {
        var drive = Drive.Drives.get(space.id);
        summary.name = drive.name || space.name;
      }

      var resp = Drive.Files.list({
        q: "'" + space.id + "' in parents and trashed = false",
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

function getSpace(spaceId) {
  var registry = getSpaceRegistry();
  var config = registry.find(function(s) { return s.id === spaceId; });

  var name = 'Unknown Space';
  var description = '';
  var type = 'folder';

  if (config) {
    name = config.name;
    description = config.description || '';
    type = config.type;
  } else {
    try {
      var file = Drive.Files.get(spaceId, {
        supportsAllDrives: true,
        fields: 'name,description'
      });
      name = file.name || name;
      description = file.description || '';
    } catch (e) {
      // fallback to defaults
    }
  }

  var items = getPageTree(spaceId, 1);

  return {
    id: spaceId,
    name: name,
    description: description,
    type: type,
    items: items
  };
}
