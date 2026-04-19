try {
  const app = require('../server/server.js');
  module.exports = app;
} catch (error) {
  console.error('Fatal API Initialization Error:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      message: 'Fatal API Initialization Error',
      error: error.message,
      stack: error.stack
    });
  };
}
