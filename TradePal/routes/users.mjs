import express from 'express';
const router = express.Router();

export let users = []; // Exporting users

// Create User
router.post('/', (req, res) => {
  const { username } = req.body;
  const newUser = { id: users.length + 1, username };
  users.push(newUser);
  res.redirect('/');
});

export default router;