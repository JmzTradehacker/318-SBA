// Renders a custom error message to the client with optional additional data
export function renderError(res, message, additionalData = {}) {
  res.render('index', {
    errorMessage: message, 
    livePrice: 0, 
    sUser: null,
    selectedTicker: 'BTC',
    orders: [],
    users: [],
    ...additionalData
  });
}

// Logs an error message to the console (for server logs and debugging)
export function logError(message) {
  console.error(`[ERROR]: ${message}`);
}

// Handles server errors with 500 status
export function handleServerError(res, message = "Internal Server Error", additionalData = {}) {
  logError(message);
  res.status(500).render('index', {
    errorMessage: message,
    livePrice: additionalData.livePrice || 0,
    sUser: additionalData.sUser || null,
    selectedTicker: additionalData.selectedTicker || 'BTC',
    orders: additionalData.orders || [],
    users: additionalData.users || []
  });
}

// Handles 404 Not Found errors
export function handleNotFound(res, message = "Page Not Found") {
  logError(message);
  res.status(404).render('index', {
    errorMessage: message
  });
}

// Handles missing user errors
export function handleMissingUser(res, additionalData = {}) {
  const message = "No user selected. Please select a user before placing a trade.";
  logError(message);
  renderError(res, message, additionalData);
}

// Handles live price fetching errors
export function handleLivePriceError(res, ticker, additionalData = {}) {
  const message = `Unable to fetch live price for ${ticker}. Please try again later.`;
  logError(message);
  renderError(res, message, additionalData);
}

// General error handler for unknown issues
export function handleUnknownError(res, error, additionalData = {}) {
  const message = "An unexpected error occurred. Please try again later.";
  logError(`Unexpected error: ${error.message}`);
  res.status(500).render('index', {
    errorMessage: message,
    ...additionalData
  });
}
