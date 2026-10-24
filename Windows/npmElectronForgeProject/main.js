const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Handle creating/removing shortcuts on Windows when installing/uninstalling via Squirrel.
if (require('electron-squirrel-startup')) app.quit();

let mainWindow;

// Spin up a local server on port 8000 to catch the Spotify loopback redirect
function startLocalServer() {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Intercept Spotify callback loopback containing the auth code
    if (parsedUrl.query && parsedUrl.query.code) {
      const code = parsedUrl.query.code;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <body style="background: #121212; color: white; font-family: sans-serif; text-align: center; padding-top: 100px;">
          <h2>Spotify Connected! Returning to iPod...</h2>
          <script>
            localStorage.setItem("spotify_auth_code_intercept", "${code}");
            window.location.href = "/";
          </script>
        </body>
        </html>
      `);
      return;
    }

    // Serve static files from your project root directory
    let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    let extname = path.extname(filePath);
    let contentType = 'text/html';
    
    if (extname === '.js') contentType = 'text/javascript';
    else if (extname === '.css') contentType = 'text/css';
    else if (extname === '.png') contentType = 'image/png';
    else if (extname === '.jpg') contentType = 'image/jpeg';
    else if (extname === '.svg') contentType = 'image/svg+xml';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(8000, '127.0.0.1');
}

const createWindow = () => {
  startLocalServer();

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: './build/icon.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Hides the default browser menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load via localhost loopback to satisfy port 8000 callback requirements
  mainWindow.loadURL('http://127.0.0.1:8000');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
