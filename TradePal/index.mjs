import dotenv from 'dotenv/config';
import express from 'express';
import axios from 'axios';
import usersRouter, { users, sUser } from './routes/users.mjs'; 
import tradesRouter, { orders, selectedTicker } from './routes/trades.mjs';
import { handleServerError } from './errorHandling/errors.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Use Routes
app.use('/users', usersRouter);
app.use('/trades', tradesRouter);

// Home Route
app.get('/', async (req, res) => {
  let livePrice = 0;
  try {
    // Fetch live price for display
    const response = await axios.get('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
    livePrice = response.data.data.price;

    // Render the view with live price, orders, and users
    res.render('index', { livePrice, orders, users, sUser: sUser || null, selectedTicker, errorMessage: null });
  } catch (error) {
    console.error("Error fetching live price:", error.message);
    handleServerError(res, "Failed to load homepage.", {
      orders, users, selectedTicker, sUser, livePrice: 0
    });
  }
});

// Global error handling
app.use((err, req, res, next) => {
  handleServerError(res, err.message);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});