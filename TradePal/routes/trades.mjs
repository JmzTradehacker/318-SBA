import express from 'express';
import axios from 'axios';
import { sUser } from './users.mjs';

const router = express.Router();

export let orders = []; // Export orders
export let selectedTicker = 'BTC';
let livePrice = 0;


// Fetch live crypto price (used before placing orders)
async function fetchLivePrice(ticker = selectedTicker) {
  const response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${ticker}-USDT`);
  return parseFloat(response.data.data.price);
}

// Fetch live price every x milliseconds
setInterval(async () => {
    try {
      livePrice = await fetchLivePrice(selectedTicker);
      //console.log("Price is live",  livePrice); //Use when needed
    } catch (error) {
      console.error("Error updating live price:", error.message);
    }
  }, 1000); // x milliseconds
  
  // Route to get the current live price
router.get('/live-price', (req, res) => {
    res.json({ livePrice, selectedTicker });
  });

  // Route to set a new ticker
router.post('/set-ticker', (req, res) => {
    selectedTicker = req.body.ticker;
    res.redirect('/');
  });

// Place Buy or Sell Order
router.post('/trade', async (req, res) => {
  const { orderType } = req.body;

  if (sUser) {
    const livePrice = await fetchLivePrice(selectedTicker);
    const newOrder = {
      id: orders.length + 1,
      userId: sUser.id,
      username: sUser.username,
      orderType,
      price: livePrice,
      ticker: selectedTicker,
      time: new Date().toLocaleTimeString(),
      status: 'Open'
    };
    orders.push(newOrder);
  } else {
    console.error("No user selected. Please select a user before placing a trade.");
  }

  res.redirect('/');
});

// Close Order
router.post('/close-order/:id', async (req, res) => {
  const orderId = req.params.id;
  const order = orders.find(o => o.id == orderId);

  if (order && order.status === 'Open') {
    const closePrice = await fetchLivePrice(order.ticker);
    const priceMovement = closePrice - order.price;
    const profitOrLoss = priceMovement > 0 ? `-${priceMovement.toFixed(2)}` : `+${priceMovement.toFixed(2)}`;

    order.status = 'Closed $' + closePrice;
    order.closePrice = closePrice;               // Capture close price
    order.priceMovement = profitOrLoss;          // Record profit or loss with movement
    order.result = (order.orderType === 'BUY' && closePrice > order.price) || 
                   (order.orderType === 'SELL' && closePrice < order.price) 
                   ? 'Profit: $' + profitOrLoss
                   : 'Loss: $' + profitOrLoss;
  }

  res.redirect('/');
});

export default router;