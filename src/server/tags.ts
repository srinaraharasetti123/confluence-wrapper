function getTagsForFile(fileId: string): string[] {
  const sheet = getTagSheet_();
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const tags: string[] = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === fileId) {
      tags.push(data[i][1] as string);
    }
  }

  return tags;
}

function setTagsForFile(fileId: string, tags: string[]): void {
  const sheet = getTagSheet_();
  if (!sheet) return;

  const email = Session.getActiveUser().getEmail();
  const now = new Date().toISOString();

  // Remove existing tags for this file
  const data = sheet.getDataRange().getValues();
  const rowsToDelete: number[] = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === fileId) {
      rowsToDelete.push(i + 1);
    }
  }

  for (const row of rowsToDelete) {
    sheet.deleteRow(row);
  }

  // Add new tags
  for (const tag of tags) {
    sheet.appendRow([fileId, tag.trim().toLowerCase(), email, now]);
  }
}

function addTagToFile(fileId: string, tag: string): string[] {
  const existing = getTagsForFile(fileId);
  const normalized = tag.trim().toLowerCase();

  if (existing.includes(normalized)) return existing;

  const sheet = getTagSheet_();
  if (!sheet) return existing;

  const email = Session.getActiveUser().getEmail();
  sheet.appendRow([fileId, normalized, email, new Date().toISOString()]);

  return [...existing, normalized];
}

function removeTagFromFile(fileId: string, tag: string): string[] {
  const sheet = getTagSheet_();
  if (!sheet) return [];

  const normalized = tag.trim().toLowerCase();
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === fileId && data[i][1] === normalized) {
      sheet.deleteRow(i + 1);
    }
  }

  return getTagsForFile(fileId);
}

function searchByTag(tag: string): SearchResult[] {
  const sheet = getTagSheet_();
  if (!sheet) return [];

  const normalized = tag.trim().toLowerCase();
  const data = sheet.getDataRange().getValues();
  const fileIds: string[] = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === normalized && !fileIds.includes(data[i][0] as string)) {
      fileIds.push(data[i][0] as string);
    }
  }

  return fileIds.map(id => {
    try {
      const file = Drive.Files!.get(id, {
        fields: 'id,name,mimeType,modifiedTime,lastModifyingUser,webViewLink',
        supportsAllDrives: true
      });
      return {
        id: file.id!,
        name: file.name || 'Untitled',
        mimeType: file.mimeType || '',
        snippet: `Tagged: ${normalized}`,
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

function getAllTags(): TagCount[] {
  const sheet = getTagSheet_();
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const counts: Record<string, number> = {};

  for (let i = 1; i < data.length; i++) {
    const tag = data[i][1] as string;
    counts[tag] = (counts[tag] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function getTagSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
  try {
    const sheetId = getTagSheetId();
    const ss = SpreadsheetApp.openById(sheetId);
    return ss.getSheetByName('Tags');
  } catch (e) {
    return null;
  }
}
