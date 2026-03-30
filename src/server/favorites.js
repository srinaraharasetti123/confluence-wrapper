function getFavorites() {
  var ids = getFavoriteIds_();

  return ids.map(function(id) {
    try {
      var file = Drive.Files.get(id, {
        fields: 'id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink',
        supportsAllDrives: true
      });
      return {
        id: file.id,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: '',
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

function addFavorite(fileId) {
  var ids = getFavoriteIds_();
  if (!ids.includes(fileId)) {
    ids.push(fileId);
    saveFavoriteIds_(ids);
  }
}

function removeFavorite(fileId) {
  var ids = getFavoriteIds_().filter(function(id) { return id !== fileId; });
  saveFavoriteIds_(ids);
}

function isFavorite_(fileId) {
  return getFavoriteIds_().includes(fileId);
}

function getFavoriteIds_() {
  var props = PropertiesService.getUserProperties();
  var raw = props.getProperty('favorites');
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveFavoriteIds_(ids) {
  var props = PropertiesService.getUserProperties();
  props.setProperty('favorites', JSON.stringify(ids));
}
