var CONFIG_KEY = 'space_registry';
var TAG_SHEET_KEY = 'tag_sheet_id';

function getSpaceRegistry() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(CONFIG_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveSpaceRegistry(spaces) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(CONFIG_KEY, JSON.stringify(spaces));
}

function registerSpace(id, name, type, description) {
  var registry = getSpaceRegistry();
  var existing = registry.findIndex(function(s) { return s.id === id; });
  var entry = { id: id, name: name, type: type, description: description || '' };

  if (existing >= 0) {
    registry[existing] = entry;
  } else {
    registry.push(entry);
  }

  saveSpaceRegistry(registry);
  return registry;
}

function unregisterSpace(id) {
  var registry = getSpaceRegistry().filter(function(s) { return s.id !== id; });
  saveSpaceRegistry(registry);
  return registry;
}

function getTagSheetId() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty(TAG_SHEET_KEY);

  if (!sheetId) {
    var ss = SpreadsheetApp.create('_knowledge_base_tags');
    var sheet = ss.getActiveSheet();
    sheet.setName('Tags');
    sheet.appendRow(['fileId', 'tag', 'addedBy', 'addedAt']);
    sheet.setFrozenRows(1);
    sheetId = ss.getId();
    props.setProperty(TAG_SHEET_KEY, sheetId);
  }

  return sheetId;
}

function setupSampleSpace() {
  var folder = DriveApp.createFolder('Knowledge Base - Sample Space');

  var engFolder = folder.createFolder('Engineering');
  var doc1 = DocumentApp.create('Getting Started Guide');
  DriveApp.getFileById(doc1.getId()).moveTo(engFolder);
  var doc2 = DocumentApp.create('Architecture Overview');
  DriveApp.getFileById(doc2.getId()).moveTo(engFolder);

  var subFolder = engFolder.createFolder('API Documentation');
  var doc3 = DocumentApp.create('REST API Reference');
  DriveApp.getFileById(doc3.getId()).moveTo(subFolder);

  var hrFolder = folder.createFolder('HR & Policies');
  var doc4 = DocumentApp.create('Employee Handbook');
  DriveApp.getFileById(doc4.getId()).moveTo(hrFolder);
  var doc5 = DocumentApp.create('Onboarding Checklist');
  DriveApp.getFileById(doc5.getId()).moveTo(hrFolder);

  var designFolder = folder.createFolder('Design');
  var doc6 = DocumentApp.create('Brand Guidelines');
  DriveApp.getFileById(doc6.getId()).moveTo(designFolder);

  return registerSpace(folder.getId(), 'Sample Knowledge Base', 'folder', 'A sample space for testing the Knowledge Base app');
}
