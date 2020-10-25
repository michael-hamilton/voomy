const bodyParser = require('body-parser');
const cors = require('cors');
const drivelist = require('drivelist');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const storage = require('node-persist');

const app = express();

(async () => {
  await storage.init({dir: 'APPDATA'});

  let HOME_PATH = await storage.getItem('HOME_PATH') || '/';

  app.use(express.static(`${__dirname}/dist`));
  app.use(cors());
  app.use(bodyParser.json());

  const createDynStatic = (path) => {
    let st = express.static(path)
    let dyn = (req, res, next) => st(req, res, next);
    dyn.setPath = (newPath) => {
      st = express.static(newPath);
    }
    return dyn;
  }

  const dyn = createDynStatic(HOME_PATH);
  app.use(dyn);

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

  app.get('/directory', async (req, res, next) => {
    try {
      const up = req.query.up ? '..' : '';
      const tmpPath = req.query.path ? req.query.path : HOME_PATH;
      const newPath = path.resolve(`${tmpPath}/${up}`);
      dyn.setPath(newPath);

      let items = await fs.readdir(newPath, {withFileTypes: true});

      items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item.name));

      const files = items.map((item,index) => {
        return {name: item.name, isDirectory: item.isDirectory(), file: encodeURI(item.name), path: `${newPath}/${item.name}`};
      });

      res.send({files, newPath, status: 'ok'});
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

  app.get('*', (req, res, next) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.listen(3000);
})();
