// Vidserve

const bodyParser = require('body-parser');
const cors = require('cors');
const drivelist = require('drivelist');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const storage = require('node-persist');
const serveStatic = require('serve-static')

const app = express();

(async () => {
  await storage.init({dir: 'APPDATA'});

  let HOME_PATH = await storage.getItem('HOME_PATH') || '/';
  let dir = '';

  app.use(express.static(`${__dirname}/dist`));
  app.use(cors());
  app.use(bodyParser.json());

  const createDynStatic = (path) => {
    let st = serveStatic(path, {index: false});
    let dyn = (req, res, next) => st(req, res, next);
    dyn.setPath = (newPath) => {
      dir = newPath;
      st = serveStatic(newPath, {index: false});
    }
    return dyn;
  }

  const dyn = serveStatic(HOME_PATH, {index: false});
  app.use('/public', dyn);

  app.get('/', async (req, res, next) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.get('/drivelist', async (req, res, next) => {
    try {
      const drives = await drivelist.list();
      res.send({drives, status: 'ok'});
    } catch (err) {
      res.send({status: 'err', message: err});
    }
  });

  app.get('/public', async (req, res, next) => {
    try {
      const currentPath = req.query.path || '';
      const parentPath = req.query.parentPath || '';
      const newPath = path.resolve(`${HOME_PATH}/${currentPath}`);
      const newParentPath = path.resolve(`${HOME_PATH}/${parentPath}`);
      const isRoot = newPath === HOME_PATH;
      console.log('currentPath ', currentPath);
      console.log('parentPath ', newParentPath);

      let items = await fs.readdir(newPath, {withFileTypes: true});
      items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item.name));

      const files = items.map((item,index) => {
        const extension = path.extname(item.name);
        const basename = path.basename(item.name, extension);
        const isDirectory = item.isDirectory();
        return {name: item.name, basename, extension, isDirectory, file: encodeURI(item.name), path: encodeURI(`/${isDirectory ? '' : 'public/'}${item.name}`)};
      });

      res.send({files, currentPath, parentPath, isRoot: isRoot, status: 'ok'});
    } catch (err) {
      res.send({status: 'err', message: err});
    }
  });

  app.get('/homepath', (req, res, next) => {
    res.send(HOME_PATH);
  });

  app.post('/homepath', async (req, res, next) => {
    HOME_PATH = req.body.homePath;
    dyn.setPath(HOME_PATH);
    await storage.setItem('HOME_PATH', HOME_PATH);
    res.send('ok');
  });

  app.post('/checkpin', async (req, res, next) => {
    USER_PIN = req.body.pin;
    const storedPin = await storage.getItem('PIN');
    if(!storedPin || USER_PIN === storedPin) {
      res.send('ok');
    }
    else {
      res.send('error');
    }
  });

  app.post('/setpin', async (req, res, next) => {
    await storage.setItem('PIN', req.body.pin);
    res.send('ok');
  });

  app.post('/delete', async (req, res, next) => {
    if(req.body.isDirectory === true) {
      await fs.rmdir(decodeURI(`${req.body.fileName}`));
    }
    else {
      await fs.unlink(decodeURI(`${HOME_PATH}/${req.body.fileName}`));
    }
    res.send('ok');
  });

  app.post('/rename', async (req, res, next) => {
    const extension = path.extname(decodeURI(req.body.oldFileName));
    const basename = path.basename(decodeURI(req.body.fileName), extension);
    await fs.rename(decodeURI(`${req.body.oldFileName}`), decodeURI(`${dir}/${basename}${extension}`));
    res.send('ok');
  });

  app.get('*', (req, res, next) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.listen(process.env.PORT || 3000);
})();
