require('dotenv').config();
const createSchema = require('./createSchema');

createSchema()
  .then(() => { console.log('✅ Tables ready'); process.exit(0); })
  .catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });
