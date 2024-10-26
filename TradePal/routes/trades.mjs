import express from 'express';
import axios from 'axios';
const router = express.Router();

let orders = [];
let livePrice = 0;

// Fetch live crypto price (used before placing orders)
async function fetchLivePrice() {
  const response = await axios.get('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
  return response.data.data.price;
}

// Fetch live price for displaying on the homepage
router.get('/live-price', async (req, res, next) => {
  try {
    livePrice = await fetchLivePrice();
    res.json({ livePrice });
  } catch (error) {
    console.error("Error fetching live price:", error);
    next(error);
  }
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
      status: 'open'
    };
    orders.push(newOrder);
  }

  res.redirect('/');
});

// Close Order
router.post('/close-order/:id', async (req, res) => {
  const orderId = req.params.id;
  const order = orders.find(o => o.id == orderId);

  if (order && order.status === 'open') {
    const livePrice = await fetchLivePrice();
    order.status = 'closed';
    order.result = (order.orderType === 'buy' && livePrice > order.price) || 
                   (order.orderType === 'sell' && livePrice < order.price) 
                   ? 'Profit' : 'Loss';
  }

  res.redirect('/');
});

export default router;
