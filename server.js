const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT = __dirname;

app.disable('x-powered-by');
app.use(express.static(ROOT, {
  extensions: ['html'],
  maxAge: '5m',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.js')) res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    if (filePath.endsWith('.css')) res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  }
}));

app.get('*splat', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`XVIDSHUB public listening on ${PORT}`);
});
