const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

const eventHandler = async (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    posts[postId]['comments'].push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];

    let comment = post.comments.find((el) => el.id === id);

    comment.status = status;
    comment.content = content;
  }
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  eventHandler(type, data);

  res.send({});
});

const port = process.env.PORT || 4002;

app.listen(port, async () => {
  console.log('App is listening on port ' + port);

  const eventQueueRes = await axios.get('http://localhost:4005/events');

  for (let event of eventQueueRes.data) {
    console.log('Processing event: ', event.type);

    eventHandler(event.type, event.data);
  }
});
