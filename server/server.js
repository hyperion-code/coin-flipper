const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Friendly entry routes for hosted deployments.
app.get('/', (req, res) => {
  res.redirect('/public/index.html');
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/dashboard.html');
});

// In-memory data store
let coinState = {
  lastFlip: null,
  result: null, // 'heads' or 'tails'
  presetOutcome: null, // If admin sets this, it will be used for next flip
  flipHistory: [] // Array of {timestamp, result}
};

// Helper function to generate random flip
function randomFlip() {
  return Math.random() < 0.5 ? 'heads' : 'tails';
}

// API Routes

// Public: Flip the coin
app.post('/api/flip', (req, res) => {
  const now = new Date();
  
  // Determine outcome
  let outcome;
  if (coinState.presetOutcome) {
    outcome = coinState.presetOutcome;
    coinState.presetOutcome = null; // Use preset outcome only once
  } else {
    outcome = randomFlip();
  }

  // Update state
  coinState.lastFlip = now;
  coinState.result = outcome;
  coinState.flipHistory.push({
    timestamp: now,
    result: outcome
  });

  res.json({
    result: outcome,
    timestamp: now
  });
});

// Public: Get current coin state
app.get('/api/coin-state', (req, res) => {
  res.json({
    lastFlip: coinState.lastFlip,
    result: coinState.result,
    totalFlips: coinState.flipHistory.length
  });
});

// Public: Get flip history
app.get('/api/flip-history', (req, res) => {
  res.json(coinState.flipHistory);
});

// Admin: Set preset outcome for next flip
app.post('/api/admin/set-outcome', (req, res) => {
  const { outcome } = req.body;
  
  if (!outcome || (outcome !== 'heads' && outcome !== 'tails')) {
    return res.status(400).json({ error: 'Invalid outcome. Must be "heads" or "tails".' });
  }

  coinState.presetOutcome = outcome;
  res.json({
    success: true,
    message: `Next flip will be ${outcome}`,
    presetOutcome: outcome
  });
});

// Admin: Clear preset outcome
app.post('/api/admin/clear-outcome', (req, res) => {
  coinState.presetOutcome = null;
  res.json({
    success: true,
    message: 'Preset outcome cleared. Next flip will be random.'
  });
});

// Admin: Get full state
app.get('/api/admin/state', (req, res) => {
  res.json(coinState);
});

// Admin: Get statistics
app.get('/api/admin/stats', (req, res) => {
  const headsCount = coinState.flipHistory.filter(f => f.result === 'heads').length;
  const tailsCount = coinState.flipHistory.filter(f => f.result === 'tails').length;

  res.json({
    totalFlips: coinState.flipHistory.length,
    heads: headsCount,
    tails: tailsCount,
    headsPercentage: coinState.flipHistory.length > 0 ? (headsCount / coinState.flipHistory.length * 100).toFixed(2) : 0,
    tailsPercentage: coinState.flipHistory.length > 0 ? (tailsCount / coinState.flipHistory.length * 100).toFixed(2) : 0,
    presetOutcome: coinState.presetOutcome
  });
});

// Admin: Reset all data
app.post('/api/admin/reset', (req, res) => {
  coinState = {
    lastFlip: null,
    result: null,
    presetOutcome: null,
    flipHistory: []
  };
  res.json({
    success: true,
    message: 'All data reset'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Coin Flipper server running on http://localhost:${PORT}`);
  console.log(`Public access: http://localhost:${PORT}/public/index.html`);
  console.log(`Admin access: http://localhost:${PORT}/admin/dashboard.html`);
});
