const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const app = require('../hello');

test('root path returns hello world!', async (t) => {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  t.after(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/`);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'hello world!');
});
