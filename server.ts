import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Multer in-memory storage for handling real video uploads up to 250MB
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 250 * 1024 * 1024 },
  });

  // Dedicated direct APK download endpoints with standard Express res.download
  const handleApkDownload = (req: express.Request, res: express.Response) => {
    const requestedFile = req.params.filename || 'FB_Automation_v6_Latest.apk';
    const possiblePaths = [
      path.resolve(process.cwd(), requestedFile),
      path.resolve(process.cwd(), 'FB_Automation_v6_Latest.apk'),
      path.resolve(process.cwd(), 'FB_Automation_v6.apk'),
      path.resolve(process.cwd(), 'public', requestedFile),
      path.resolve(process.cwd(), 'public', 'FB_Automation_v6_Latest.apk'),
      path.resolve(process.cwd(), 'public', 'FB_Automation_v6.apk'),
      path.resolve(process.cwd(), 'public', 'downloads', requestedFile),
      path.resolve(process.cwd(), 'public', 'downloads', 'FB_Automation_v6_Latest.apk'),
      path.resolve(process.cwd(), 'dist', requestedFile),
      path.resolve(process.cwd(), 'dist', 'FB_Automation_v6_Latest.apk'),
      path.resolve(process.cwd(), 'FB_Automation_v5.apk'),
      path.resolve(process.cwd(), 'public', 'FB_Automation_v5.apk'),
    ];

    const apkPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!apkPath) {
      return res.status(404).send('APK file not found on server.');
    }

    const downloadName = path.basename(apkPath);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.download(apkPath, downloadName, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).send('Download failed');
        }
      }
    });
  };

  app.get('/api/download-apk', handleApkDownload);
  app.get('/FB_Automation_v6_Latest.apk', handleApkDownload);
  app.get('/FB_Automation_v6.apk', handleApkDownload);
  app.get('/FB_Automation_v5.apk', handleApkDownload);
  app.get('/downloads/:filename', handleApkDownload);
  app.get('/downloads/FB_Automation_v6_Latest.apk', handleApkDownload);
  app.get('/downloads/FB_Automation_v5.apk', handleApkDownload);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Real Facebook Video Upload endpoint - Proxies directly to Facebook Graph Video API
  app.post('/api/facebook/upload-video', upload.single('video'), async (req, res) => {
    try {
      const { page_id, access_token, description, title, targeting, post_type } = req.body;

      if (!page_id || !access_token) {
        return res.status(400).json({
          success: false,
          error: 'page_id and access_token are required for Facebook upload',
        });
      }

      // Build standard FormData for Facebook Graph Video API
      const fbFormData = new FormData();
      fbFormData.append('access_token', access_token);
      if (description) fbFormData.append('description', description);
      if (title) fbFormData.append('title', title);
      
      // Feed / Geo targeting
      if (targeting) {
        fbFormData.append('targeting', typeof targeting === 'string' ? targeting : JSON.stringify(targeting));
      }

      if (req.file) {
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'video/mp4' });
        fbFormData.append('source', blob, req.file.originalname || 'video.mp4');
      }

      // Use Meta Graph Video endpoint
      const endpoint = `https://graph-video.facebook.com/v19.0/${encodeURIComponent(page_id)}/videos`;

      const fbRes = await fetch(endpoint, {
        method: 'POST',
        body: fbFormData,
      });

      const data: any = await fbRes.json();

      if (!fbRes.ok || data.error) {
        return res.status(400).json({
          success: false,
          error: data.error?.message || 'Facebook API rejected upload',
          fbError: data.error,
        });
      }

      return res.json({
        success: true,
        id: data.id,
        postId: `${page_id}_${data.id}`,
        postUrl: `https://www.facebook.com/${page_id}/videos/${data.id}`,
        details: 'Video published to Facebook Page successfully!',
      });
    } catch (err: any) {
      console.error('Facebook upload error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Server error while uploading video to Facebook',
      });
    }
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
