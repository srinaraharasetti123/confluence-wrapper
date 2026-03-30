function getFavorites(): SearchResult[] {
  const ids = getFavoriteIds_();

  return ids.map(id => {
    try {
      const file = Drive.Files!.get(id, {
        fields: 'id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink',
        supportsAllDrives: true
      });
      return {
        id: file.id!,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: '',
        modifiedTime: file.modifiedTime || '',
        modifiedBy: file.lastModifyingUser?.displayName || 'Unknown',
        webViewLink: file.webViewLink || '',
        breadcrumb: []
      };
    } catch (e) {
      return null;
    }
  }).filter(r => r !== null) as SearchResult[];
}

function addFavorite(fileId: string): void {
  const ids = getFavoriteIds_();
  if (!ids.includes(fileId)) {
    ids.push(fileId);
    saveFavoriteIds_(ids);
  }
}

function removeFavorite(fileId: string): void {
  const ids = getFavoriteIds_().filter(id => id !== fileId);
  saveFavoriteIds_(ids);
}

function isFavorite_(fileId: string): boolean {
  return getFavoriteIds_().includes(fileId);
}

function getFavoriteIds_(): string[] {
  const props = PropertiesService.getUserProperties();
  const raw = props.getProperty('favorites');
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

function saveFavoriteIds_(ids: string[]): void {
  const props = PropertiesService.getUserProperties();
  props.setProperty('favorites', JSON.stringify(ids));
}
