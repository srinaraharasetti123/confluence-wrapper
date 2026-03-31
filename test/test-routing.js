// Test hash parsing and route matching
// Run with: node test/test-routing.js

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    passed++;
  } catch (e) {
    console.log('  FAIL: ' + name);
    console.log('        ' + e.message);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// Replicate parseHash logic
function parseHash(hash) {
  hash = hash.slice(1) || 'dashboard'; // remove #
  const [pathPart, queryPart] = hash.split('?');
  const segments = pathPart.split('/');
  const route = segments[0];
  const params = {};

  if (segments.length > 1) {
    params.id = decodeURIComponent(segments[1]);
  }
  if (segments.length > 2) {
    params.sub = decodeURIComponent(segments[2]);
  }
  if (route === 'tags' && segments.length > 1) {
    params.tag = decodeURIComponent(segments[1]);
  }
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
  }

  return [route, params];
}

const validRoutes = ['dashboard', 'space', 'search', 'favorites', 'tags', 'page', 'folder'];

console.log('\nRoute Parsing Tests:');
console.log('====================');

test('#folder/abc123 parses correctly', () => {
  const [route, params] = parseHash('#folder/abc123');
  assert(route === 'folder', 'Route should be "folder", got: ' + route);
  assert(params.id === 'abc123', 'ID should be abc123, got: ' + params.id);
  assert(validRoutes.includes(route), 'Route should be in valid routes');
});

test('#folder/1ABC-xyz_123 parses Drive-style ID', () => {
  const [route, params] = parseHash('#folder/1ABC-xyz_123');
  assert(route === 'folder', 'Route should be folder');
  assert(params.id === '1ABC-xyz_123', 'ID should preserve special chars');
});

test('#dashboard parses correctly', () => {
  const [route, params] = parseHash('#dashboard');
  assert(route === 'dashboard', 'Should be dashboard');
});

test('#space/id123 parses correctly', () => {
  const [route, params] = parseHash('#space/id123');
  assert(route === 'space', 'Should be space');
  assert(params.id === 'id123', 'Should have id');
});

test('#search?q=test parses correctly', () => {
  const [route, params] = parseHash('#search?q=test');
  assert(route === 'search', 'Should be search');
  assert(params.q === 'test', 'Should have query');
});

test('empty hash defaults to dashboard', () => {
  const [route, params] = parseHash('#');
  assert(route === 'dashboard', 'Should default to dashboard, got: ' + route);
});

test('#folder route is in valid routes list', () => {
  assert(validRoutes.includes('folder'), '"folder" must be in valid routes');
});

// Test that a real Google Drive folder ID works
test('#folder/1pQr5StUvWx-YzAbCdEfGhIjKlMnOpQrSt parses long Drive ID', () => {
  const [route, params] = parseHash('#folder/1pQr5StUvWx-YzAbCdEfGhIjKlMnOpQrSt');
  assert(route === 'folder', 'Should be folder');
  assert(params.id === '1pQr5StUvWx-YzAbCdEfGhIjKlMnOpQrSt', 'Should preserve full ID');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');

if (failed > 0) process.exit(1);
