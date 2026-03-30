const CONFIG_KEY = 'space_registry';
const TAG_SHEET_KEY = 'tag_sheet_id';

function getSpaceRegistry(): SpaceConfig[] {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(CONFIG_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as SpaceConfig[];
}

function saveSpaceRegistry(spaces: SpaceConfig[]): void {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(CONFIG_KEY, JSON.stringify(spaces));
}

function registerSpace(id: string, name: string, type: 'shared_drive' | 'folder', description?: string): SpaceConfig[] {
  const registry = getSpaceRegistry();
  const existing = registry.findIndex(s => s.id === id);
  const entry: SpaceConfig = { id, name, type, description: description || '' };

  if (existing >= 0) {
    registry[existing] = entry;
  } else {
    registry.push(entry);
  }

  saveSpaceRegistry(registry);
  return registry;
}

function unregisterSpace(id: string): SpaceConfig[] {
  const registry = getSpaceRegistry().filter(s => s.id !== id);
  saveSpaceRegistry(registry);
  return registry;
}

function getTagSheetId(): string {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty(TAG_SHEET_KEY);

  if (!sheetId) {
    const ss = SpreadsheetApp.create('_knowledge_base_tags');
    const sheet = ss.getActiveSheet();
    sheet.setName('Tags');
    sheet.appendRow(['fileId', 'tag', 'addedBy', 'addedAt']);
    sheet.setFrozenRows(1);
    sheetId = ss.getId();
    props.setProperty(TAG_SHEET_KEY, sheetId);
  }

  return sheetId;
}

function setupSampleSpace(): SpaceConfig[] {
  const folder = DriveApp.createFolder('Knowledge Base - Sample Space');

  const engFolder = folder.createFolder('Engineering');
  const doc1 = DocumentApp.create('Getting Started Guide');
  DriveApp.getFileById(doc1.getId()).moveTo(engFolder);
  const doc2 = DocumentApp.create('Architecture Overview');
  DriveApp.getFileById(doc2.getId()).moveTo(engFolder);

  const subFolder = engFolder.createFolder('API Documentation');
  const doc3 = DocumentApp.create('REST API Reference');
  DriveApp.getFileById(doc3.getId()).moveTo(subFolder);

  const hrFolder = folder.createFolder('HR & Policies');
  const doc4 = DocumentApp.create('Employee Handbook');
  DriveApp.getFileById(doc4.getId()).moveTo(hrFolder);
  const doc5 = DocumentApp.create('Onboarding Checklist');
  DriveApp.getFileById(doc5.getId()).moveTo(hrFolder);

  const designFolder = folder.createFolder('Design');
  const doc6 = DocumentApp.create('Brand Guidelines');
  DriveApp.getFileById(doc6.getId()).moveTo(designFolder);

  return registerSpace(folder.getId(), 'Sample Knowledge Base', 'folder', 'A sample space for testing the Knowledge Base app');
}
