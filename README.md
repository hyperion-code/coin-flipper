# Online Coin Flipper

An interactive coin flipper application with a public interface and admin control panel. Track all flips and control outcomes!

## Features

- **Public Coin Flipper** - Anyone can flip the coin with beautiful animations
- **Real-time Statistics** - Track heads vs tails distribution
- **Flip History** - View all previous flips with timestamps
- **Admin Dashboard** - Preset flip outcomes or let them be random
- **Auto-refresh Admin Panel** - Updates every 2 seconds

## Local Setup

1. Install Node.js (v14+)
2. Clone the repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Access the app:
   - Public: http://localhost:3000/public/index.html
   - Admin: http://localhost:3000/admin/dashboard.html

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Deploy!

### Deploy to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys automatically

### Deploy to Heroku

1. Push code to GitHub (or use `heroku git:remote -a your-app-name`)
2. Deploy: `git push heroku main`

## Project Structure

```
├── server/
│   └── server.js          # Express backend with API routes
├── public/
│   └── index.html         # Public coin flipper interface
├── admin/
│   └── dashboard.html     # Admin control dashboard
├── package.json           # Dependencies
└── Procfile              # For cloud deployment
```

## API Endpoints

### Public
- `POST /api/flip` - Flip the coin
- `GET /api/coin-state` - Get current coin state
- `GET /api/flip-history` - Get all flip history

### Admin
- `POST /api/admin/set-outcome` - Set next flip outcome
- `POST /api/admin/clear-outcome` - Clear preset outcome
- `GET /api/admin/state` - Get full application state
- `GET /api/admin/stats` - Get statistics
- `POST /api/admin/reset` - Reset all data

## License

ISC
