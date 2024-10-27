import dotenv from 'dotenv/config';
import express from 'express';
import axios from 'axios';
import usersRouter, { users } from './routes/users.mjs'; // Import users explicitly
import tradesRouter, { orders } from './routes/trades.mjs'; // Import orders explicitly

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
    res.render('index', { livePrice, orders, users });
  } catch (error) {
    console.error("Error fetching live price:", error.message);
    res.status(500).send("Seems like we messed up somewhere...");
  }
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});