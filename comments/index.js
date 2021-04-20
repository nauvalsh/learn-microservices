const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  let data = { id: commentId, content, status: 'pending' };

  comments.push(data);

  commentsByPostId[req.params.id] = comments;

  await axios.post('http://localhost:4005/events', {
    event: {
      type: 'CommentCreated',
      data: {
        ...data,
        postId: req.params.id,
      },
    },
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  console.log('Received Event ', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;

    let comments = commentsByPostId[postId];
    let comment = comments.find((el) => el.id === id);

    comment.status = status;

    await axios.post('http://localhost:4005/events', {
      event: {
        type: 'CommentUpdated',
        data: {
          id,
          status,
          postId,
          content,
        },
      },
    });
  }

  res.send({});
});

const port = process.env.PORT || 4001;

app.listen(port, () => console.log('App is listening on port ' + port));
