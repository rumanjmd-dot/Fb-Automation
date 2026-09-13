import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Dedicated direct APK download endpoints with strict attachment headers
  const handleApkDownload = (req: express.Request, res: express.Response) => {
    const possiblePaths = [
      path.resolve(process.cwd(), 'public', 'FB_Automation_v5.apk'),
      path.resolve(process.cwd(), 'dist', 'FB_Automation_v5.apk'),
      path.resolve(process.cwd(), 'public', 'downloads', 'FB_Automation_v5.apk'),
    ];

    let apkPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!apkPath) {
      return res.status(404).send('APK file not found on server.');
    }

    const stat = fs.statSync(apkPath);

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="FB_Automation_v5.apk"');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-cache');

    const fileStream = fs.createReadStream(apkPath);
    fileStream.pipe(res);
  };

  app.get('/api/download-apk', handleApkDownload);
  app.get('/FB_Automation_v5.apk', handleApkDownload);
  app.get('/downloads/FB_Automation_v5.apk', handleApkDownload);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
