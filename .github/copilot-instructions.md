<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Coin Flipper Project

An online coin flipper application with a public interface and admin control panel. Features include:
- Public coin flip interface with flip history tracking
- Admin dashboard for controlling flip outcomes
- All flips are tracked with timestamps
- Real-time statistics (heads vs tails count)

### Project Structure
- `/server/server.js` - Express backend with API routes
- `/public/index.html` - Public coin flipper interface
- `/admin/dashboard.html` - Admin control dashboard
- `/package.json` - Node.js dependencies

### How to Run
1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Access public flipper: http://localhost:3000/public/index.html
4. Access admin panel: http://localhost:3000/admin/dashboard.html

### Features
- **Public Flip**: Anyone can flip the coin via the public interface
- **Flip History**: All flips are tracked and displayed with timestamps
- **Admin Control**: Admins can preset the next flip outcome
- **Statistics**: Real-time stats showing heads/tails distribution
- **Auto-refresh**: Admin dashboard auto-refreshes every 2 seconds
