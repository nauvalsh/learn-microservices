const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

let events = [];

app.post('/events', (req, res) => {
  const { event } = req.body;

  events.push(event);

  axios.post('http://localhost:4000/events', event);
  axios.post('http://localhost:4001/events', event);
  axios.post('http://localhost:4002/events', event);
  axios.post('http://localhost:4003/events', event);

  res.status({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
});

const port = process.env.PORT || 4005;

app.listen(port, () => console.log('App is listening on port ' + port));
