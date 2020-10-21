const bodyParser = require('body-parser');
const cors = require('cors');
const drivelist = require('drivelist');
const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const userid = require('userid');
const storage = require('node-persist');

const app = express();

(async () => {
  await storage.init({dir: 'APPDATA'});

  let VIDEO_PATH = await storage.getItem('VIDEO_PATH') || '/';

  app.use(express.static(`${__dirname}/dist`));
  app.use(cors());
  app.use(bodyParser.json());

  const createDynStatic = (path) => {
    let st = express.static(path)
    let dyn = (req, res, next) => st(req, res, next);
    dyn.setPath = (newPath) => st = express.static(newPath);
    return dyn;
  }

  const dyn = createDynStatic(VIDEO_PATH);
  app.use(dyn);

  app.get('/', async (req, res, next) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.get('/drivelist', async (req, res, next) => {
    res.send(await drivelist.list());
  });

  app.get('/videolist', async (req, res, next) => {
    try {
      let files = fs.readdirSync(VIDEO_PATH);
      files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
      res.send(files.map(file => encodeURI(file)));
    } catch (err) {
      res.send([]);
    }
  });

  app.get('/videopath', (req, res, next) => {
    res.send(VIDEO_PATH);
  });

  app.post('/videopath', async (req, res, next) => {
    VIDEO_PATH = req.body.videoPath;
    dyn.setPath(VIDEO_PATH);
    await storage.setItem('VIDEO_PATH', VIDEO_PATH);
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

  app.post('/mountdrive', async (req, res, next) => {
    try {
      fs.mkdirSync('/mnt/a');
    }
    catch (err) {
      console.log('Mountpoint already exists.')
    }
    try {
      fs.fchownSync('/mnt/a', userid.uid('pi'), userid.gid('pi'));
    }
    catch (err) {
      console.log('Mountpoint ownership already set.')
    }
    mnt = spawn('sudo', ['mount', `${req.body.device}`, `/mnt/a`]);
    mnt.stdout.on('data', data => console.log(`data: ${data}`));
    mnt.stderr.on('data', data => console.log(`err: ${data}`));
    res.send('ok');
  });

  app.get('*', (req, res, next) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.listen(3000);
})();
