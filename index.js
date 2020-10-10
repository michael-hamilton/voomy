const express = require('express');
const drivelist = require('drivelist');
const app = express();

app.get('/', async (req, res) => {
  res.send('/');
});

app.get('/drives', async (req, res) => {
  res.send(await drivelist.list());
});

app.listen(3000);
