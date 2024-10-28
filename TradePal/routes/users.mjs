import express from 'express';
const router = express.Router();

export let users = []; // Exporting users
export let sUser = null

// Create User
router.post('/', (req, res) => {
  const { username } = req.body;
  const newUser = { id: users.length + 1, username };
  users.push(newUser);
  sUser = newUser;
  res.redirect('/');
});

// Select User 
router.get('/select', (req, res) => {
  const userId = parseInt(req.query.userId);
  sUser = users.find(user => user.id === userId);
  res.redirect('/');
});

export default router;