require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket/gameSocket');

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Detoxism server running on port ${PORT}`);
});
