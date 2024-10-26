import dotenv from 'dotenv/config';
import express from 'express';
import axios from 'axios';
import usersRouter from './routes/users.mjs';
import tradesRouter from './routes/trades.mjs';
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Use Routes
app.use('/users', usersRouter);
app.use('/trades', tradesRouter);

// Global error handling
app.use((err, req, res, next) => {
    res.status(500).send("Seems like we messed up somewhere...");
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });