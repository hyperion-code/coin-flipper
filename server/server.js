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

function normalizePlayerName(name) {
  if (typeof name !== 'string') {
    return '';
  }

  return name.trim().slice(0, 40);
}

// Build synthetic flip history using clustered activity blocks every few minutes.
function generateFakeFlipHistory(options = {}) {
  const weeksBack = Number(options.weeksBack) > 0 ? Number(options.weeksBack) : 3;
  const minGapMinutes = Number(options.minGapMinutes) > 0 ? Number(options.minGapMinutes) : 2;
  const maxGapMinutes = Number(options.maxGapMinutes) >= minGapMinutes
    ? Number(options.maxGapMinutes)
    : 5;

  const now = Date.now();
  const start = now - weeksBack * 7 * 24 * 60 * 60 * 1000;
  const history = [];
  const fakeNames = [
    'Avery',
    'Jordan',
    'Riley',
    'Taylor',
    'Parker',
    'Casey',
    'Morgan',
    'Cameron',
    'Quinn',
    'Reese'
  ];

  let cursor = start;

  while (cursor < now) {
    const clusterCount = 2 + Math.floor(Math.random() * 4); // 2-5 flips per cluster

    for (let i = 0; i < clusterCount && cursor < now; i += 1) {
      // Small spacing inside a cluster to feel like a short active burst.
      const burstSpacingMs = (20 + Math.floor(Math.random() * 100)) * 1000;
      cursor += burstSpacingMs;

      if (cursor >= now) {
        break;
      }

      history.push({
        timestamp: new Date(cursor),
        result: randomFlip(),
        playerName: fakeNames[Math.floor(Math.random() * fakeNames.length)],
        betText: null,
        headsConsequence: null,
        tailsConsequence: null,
        resolvedConsequence: null
      });

      if (Math.random() < 0.35) {
        const currentFlip = history[history.length - 1];
        currentFlip.betText = 'Friendly challenge';
        currentFlip.headsConsequence = 'Buys snacks for the group';
        currentFlip.tailsConsequence = 'Washes dishes tonight';
        currentFlip.resolvedConsequence = currentFlip.result === 'heads'
          ? currentFlip.headsConsequence
          : currentFlip.tailsConsequence;
      }
    }

    // Jump to the next activity block by a few minutes.
    const gapMinutes = minGapMinutes + Math.floor(Math.random() * (maxGapMinutes - minGapMinutes + 1));
    cursor += gapMinutes * 60 * 1000;
  }

  return history;
}

// API Routes

// Public: Flip the coin
app.post('/api/flip', (req, res) => {
  const now = new Date();
  const playerName = normalizePlayerName(req.body?.playerName);
  const betText = typeof req.body?.betText === 'string' ? req.body.betText.trim().slice(0, 140) : '';
  const headsConsequence = typeof req.body?.headsConsequence === 'string' ? req.body.headsConsequence.trim().slice(0, 180) : '';
  const tailsConsequence = typeof req.body?.tailsConsequence === 'string' ? req.body.tailsConsequence.trim().slice(0, 180) : '';

  if (!playerName) {
    return res.status(400).json({ error: 'Player name is required.' });
  }
  
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
  const normalizedBetText = betText || null;
  const normalizedHeadsConsequence = headsConsequence || null;
  const normalizedTailsConsequence = tailsConsequence || null;
  const resolvedConsequence = outcome === 'heads' ? normalizedHeadsConsequence : normalizedTailsConsequence;

  coinState.flipHistory.push({
    timestamp: now,
    result: outcome,
    playerName,
    betText: normalizedBetText,
    headsConsequence: normalizedHeadsConsequence,
    tailsConsequence: normalizedTailsConsequence,
    resolvedConsequence: resolvedConsequence || null
  });

  res.json({
    result: outcome,
    timestamp: now,
    playerName,
    betText: normalizedBetText,
    headsConsequence: normalizedHeadsConsequence,
    tailsConsequence: normalizedTailsConsequence,
    resolvedConsequence: resolvedConsequence || null
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

// Admin: Generate fake random historical flips for the last few weeks.
app.post('/api/admin/generate-fake-history', (req, res) => {
  const generatedHistory = generateFakeFlipHistory(req.body || {});

  coinState.flipHistory = generatedHistory;

  if (generatedHistory.length > 0) {
    const latest = generatedHistory[generatedHistory.length - 1];
    coinState.lastFlip = latest.timestamp;
    coinState.result = latest.result;
  } else {
    coinState.lastFlip = null;
    coinState.result = null;
  }

  res.json({
    success: true,
    generatedCount: generatedHistory.length,
    firstFlip: generatedHistory.length > 0 ? generatedHistory[0].timestamp : null,
    lastFlip: generatedHistory.length > 0 ? generatedHistory[generatedHistory.length - 1].timestamp : null,
    message: `Generated ${generatedHistory.length} fake historical flips.`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Coin Flipper server running on http://localhost:${PORT}`);
  console.log(`Public access: http://localhost:${PORT}/public/index.html`);
  console.log(`Admin access: http://localhost:${PORT}/admin/dashboard.html`);
});
