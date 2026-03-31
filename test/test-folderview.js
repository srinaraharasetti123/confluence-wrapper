// Test FolderView template rendering and JS syntax
// Run with: node test/test-folderview.js

// Mock Utils
const Utils = {
  escape(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; },
  formatDate(d) { return d || ''; },
  getMimeIcon(m) { return m === 'application/vnd.google-apps.folder' ? 'F' : 'D'; },
  getMimeLabel(m) { return m === 'application/vnd.google-apps.folder' ? 'Folder' : 'Doc'; },
  isFolder(m) { return m === 'application/vnd.google-apps.folder'; },
  loading() { return '<div>Loading...</div>'; },
  emptyState(icon, title, msg) { return '<div>' + title + ': ' + msg + '</div>'; }
};

const App = { state: { spaces: [] } };

// Copy FolderView from components.html (updated version)
const FolderView = {
  template(folder, children, isSpace) {
    return `
      <div class="breadcrumb">
        <a href="#dashboard">Home</a>
        ${folder.breadcrumb.map(b => `
          <span class="sep">/</span>
          <a href="#" data-action="open-folder" data-id="${b.id}">${Utils.escape(b.name)}</a>
        `).join('')}
        <span class="sep">/</span>
        <span>${Utils.escape(folder.name)}</span>
      </div>

      <div class="page-detail-header">
        <div>
          <h1>\u{1F4C1} ${Utils.escape(folder.name)}</h1>
          ${folder.description ? `<p style="color: var(--text-secondary); margin-top: 8px;">${Utils.escape(folder.description)}</p>` : ''}
        </div>
        ${isSpace
          ? `<span class="btn btn-secondary" style="pointer-events:none; opacity:0.6;">\u2713 Space</span>`
          : `<button class="btn btn-primary" data-action="convert-to-space" data-id="${folder.id}" data-name="${Utils.escape(folder.name)}" data-desc="${Utils.escape(folder.description)}">Convert to Space</button>`
        }
      </div>

      <div class="folder-meta">
        <span>Modified by ${Utils.escape(folder.modifiedBy)}</span>
        <span>${Utils.formatDate(folder.modifiedTime)}</span>
        <span>Created ${Utils.formatDate(folder.createdTime)}</span>
        <a href="${folder.webViewLink}" target="_blank" style="color: var(--primary);">Open in Drive</a>
      </div>

      <div class="card cf-index-card">
        <div class="card-header">
          <span class="card-title">Page Index</span>
          <span style="color: var(--text-light); font-size: 13px;">${children.length} item${children.length !== 1 ? 's' : ''}</span>
        </div>
        ${children.length > 0 ? `
          <div class="cf-tree">
            ${children.map((node, index) => this.treeNodeHtml(node, 0, index === children.length - 1)).join('')}
          </div>
        ` : Utils.emptyState('\u{1F4C2}', 'Empty folder', 'No files found in this folder')}
      </div>
    `;
  },

  treeNodeHtml(node, depth, isLast) {
    const isFolder = Utils.isFolder(node.mimeType);
    const hasChildren = isFolder && node.hasChildren;

    return `
      <div class="cf-tree-row ${depth === 0 ? 'cf-tree-root' : ''} ${isLast ? 'cf-tree-last' : ''}" style="--depth: ${depth}">
        <div class="cf-tree-indent">
          ${depth > 0 ? `<span class="cf-tree-connector ${isLast ? 'last' : ''}">${isLast ? '\u2514' : '\u251C'}</span>` : ''}
        </div>
        <div class="cf-tree-content">
          ${isFolder
            ? `<span class="cf-tree-toggle ${hasChildren ? '' : 'empty'}" data-action="cf-toggle" data-id="${node.id}">\u25B6</span>`
            : `<span class="cf-tree-toggle empty"></span>`
          }
          <span class="cf-tree-icon">${Utils.getMimeIcon(node.mimeType)}</span>
          <span class="cf-tree-name">
            ${isFolder
              ? `<a href="#" data-action="open-folder" data-id="${node.id}">${Utils.escape(node.name)}</a>`
              : `<a href="${node.webViewLink}" target="_blank">${Utils.escape(node.name)}</a>`
            }
          </span>
          <span class="cf-tree-date">${Utils.formatDate(node.modifiedTime)}</span>
          <span class="cf-tree-author">${Utils.escape(node.modifiedBy)}</span>
        </div>
      </div>
      ${isFolder ? `<div class="cf-tree-children collapsed" id="cf-children-${node.id}" style="--depth: ${depth}"></div>` : ''}
    `;
  }
};

// ===== TESTS =====

const folder = {
  id: 'folder123',
  name: 'RnD team folder 2026',
  description: 'Test folder',
  modifiedTime: '2026-03-28T10:00:00Z',
  modifiedBy: 'John',
  createdTime: '2026-01-01T00:00:00Z',
  webViewLink: 'https://drive.google.com/folder123',
  breadcrumb: [{ id: 'parent1', name: 'My Drive' }]
};

const children = [
  { id: 'sub1', name: 'Subfolder', mimeType: 'application/vnd.google-apps.folder', parentId: 'folder123', modifiedTime: '2026-03-27T10:00:00Z', modifiedBy: 'Jane', hasChildren: true, webViewLink: '', iconLink: '' },
  { id: 'doc1', name: 'Design Doc', mimeType: 'application/vnd.google-apps.document', parentId: 'folder123', modifiedTime: '2026-03-26T10:00:00Z', modifiedBy: 'Bob', hasChildren: false, webViewLink: 'https://docs.google.com/doc1', iconLink: '' },
];

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log('  PASS: ' + name); passed++; }
  catch (e) { console.log('  FAIL: ' + name + '\n        ' + e.message); failed++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nFolderView Tests:');
console.log('=================');

test('template renders without error', () => {
  const html = FolderView.template(folder, children, false);
  assert(typeof html === 'string' && html.length > 0, 'Should return non-empty string');
});

test('no direct #folder/ href links (uses data-action instead)', () => {
  const html = FolderView.template(folder, children, false);
  assert(!html.includes('href="#folder/'), 'Should NOT contain href="#folder/" — must use data-action="open-folder"');
});

test('folder links use data-action="open-folder"', () => {
  const html = FolderView.template(folder, children, false);
  assert(html.includes('data-action="open-folder"'), 'Folder links must use data-action');
});

test('breadcrumb uses data-action for folder links', () => {
  const html = FolderView.template(folder, children, false);
  assert(html.includes('data-action="open-folder" data-id="parent1"'), 'Breadcrumb should use data-action');
});

test('tree folder nodes use data-action', () => {
  const html = FolderView.treeNodeHtml(children[0], 0, false);
  assert(html.includes('data-action="open-folder" data-id="sub1"'), 'Tree folder should use data-action');
});

test('doc links still use direct href with target=_blank', () => {
  const html = FolderView.treeNodeHtml(children[1], 0, true);
  assert(html.includes('href="https://docs.google.com/doc1"'), 'Doc should link directly');
  assert(html.includes('target="_blank"'), 'Doc should open in new tab');
});

test('Convert to Space button present when not a space', () => {
  const html = FolderView.template(folder, children, false);
  assert(html.includes('data-action="convert-to-space"'), 'Should have convert button');
});

test('Space badge shown when already a space', () => {
  const html = FolderView.template(folder, children, true);
  assert(!html.includes('data-action="convert-to-space"'), 'Should not have convert button');
  assert(html.includes('\u2713 Space'), 'Should show space badge');
});

test('empty children shows empty state', () => {
  const html = FolderView.template(folder, [], false);
  assert(html.includes('Empty folder'), 'Should show empty state');
});

test('folder toggle has cf-toggle action', () => {
  const html = FolderView.treeNodeHtml(children[0], 0, false);
  assert(html.includes('data-action="cf-toggle"'), 'Folder should have toggle action');
});

test('nested depth connectors render correctly', () => {
  const html = FolderView.treeNodeHtml(children[1], 2, true);
  assert(html.includes('--depth: 2'), 'Should have depth 2');
  assert(html.includes('\u2514'), 'Last item should have corner connector');
});

test('special chars in folder name are escaped in data attributes', () => {
  const specialFolder = { ...folder, name: 'Test "quotes"', description: 'Desc "here"' };
  const html = FolderView.template(specialFolder, [], false);
  assert(html.includes('data-name="Test &quot;quotes&quot;"'), 'Quotes should be escaped in data-name');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
if (failed > 0) process.exit(1);
