import express from 'express';
import axios from 'axios';
import { users } from './users.mjs'; // Import users from users.mjs

const router = express.Router();

export let orders = []; // Export orders
let livePrice = 0;

// Fetch live crypto price (used before placing orders)
async function fetchLivePrice() {
  const response = await axios.get('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
  return parseFloat(response.data.data.price);
}

// Fetch live price every x milliseconds
setInterval(async () => {
    try {
      livePrice = await fetchLivePrice();
      //console.log("Price is live",  livePrice); //Use when needed
    } catch (error) {
      console.error("Error updating live price:", error.message);
    }
  }, 1000); // x milliseconds
  
  // Route to get the current live price
  router.get('/live-price', (req, res) => {
    res.json({ livePrice });
  });

// Place Buy or Sell Order
router.post('/trade', async (req, res) => {
  const { userId, orderType } = req.body;
  const user = users.find(u => u.id == userId);

  if (user) {
    const livePrice = await fetchLivePrice();
    const newOrder = {
      id: orders.length + 1,
      userId: user.id,
      username: user.username,
      orderType,
      price: livePrice,
      time: new Date().toLocaleTimeString(),
      status: 'Open'
    };
    orders.push(newOrder);
  }

  res.redirect('/');
});

// Close Order
router.post('/close-order/:id', async (req, res) => {
  const orderId = req.params.id;
  const order = orders.find(o => o.id == orderId);

  if (order && order.status === 'Open') {
    const closePrice = await fetchLivePrice();
    const priceMovement = closePrice - order.price;
    const profitOrLoss = priceMovement > 0 ? `${priceMovement.toFixed(2)}` : `${priceMovement.toFixed(2)}`;

    order.status = 'Closed';
    order.closePrice = closePrice;               // Capture close price
    order.priceMovement = profitOrLoss;          // Record profit or loss with movement
    order.result = (order.orderType === 'BUY' && closePrice > order.price) || 
                   (order.orderType === 'SELL' && closePrice < order.price) 
                   ? 'Profit: +' + profitOrLoss
                   : 'Loss: -' + profitOrLoss;
  }

  res.redirect('/');
});

export default router;
