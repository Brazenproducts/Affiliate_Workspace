const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<!DOCTYPE html>
<html><head><title>Upload BLOX Logo</title></head>
<body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center">
<h2>Upload BLOX Logo</h2>
<p>Pick the PNG file and hit Upload.</p>
<form method="POST" action="/upload" enctype="multipart/form-data">
<input type="file" name="file" accept="image/*" style="margin:20px"><br>
<button type="submit" style="padding:12px 24px;font-size:16px;cursor:pointer">Upload</button>
</form>
</body></html>`);
  } else if (req.method === 'POST' && req.url === '/upload') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      // Parse multipart boundary
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const parts = buf.toString('binary').split('--' + boundary);
      for (const part of parts) {
        if (part.includes('filename=')) {
          const fnMatch = part.match(/filename="([^"]+)"/);
          const filename = fnMatch ? fnMatch[1] : 'blox-logo.png';
          const headerEnd = part.indexOf('\r\n\r\n') + 4;
          const bodyEnd = part.lastIndexOf('\r\n');
          const fileData = Buffer.from(part.substring(headerEnd, bodyEnd), 'binary');
          const dest = path.join(__dirname, 'blox-logo.png');
          fs.writeFileSync(dest, fileData);
          console.log('FILE SAVED:', dest, fileData.length, 'bytes');
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('<html><body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center"><h2>Got it! ✅</h2><p>You can close this tab.</p></body></html>');
          return;
        }
      }
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('No file found');
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8899, '0.0.0.0', () => console.log('Upload server running on port 8899'));
