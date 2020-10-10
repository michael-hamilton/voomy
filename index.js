const express = require('express');
const drivelist = require('drivelist');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

let VIDEO_PATH = '/';

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
  }
  catch(err) {
    res.send([]);
  }
});

app.get('/videopath', (req, res, next) => {
  res.send(VIDEO_PATH);
});

app.post('/videopath', (req, res, next) => {
  VIDEO_PATH = req.body.videoPath;
  dyn.setPath(VIDEO_PATH);
  res.send('ok');
});

app.get('*', (req, res, next) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.listen(3000);
