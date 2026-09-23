// Polyfill browser globals if running in pure serverless Node.js (AWS Lambda / Vercel)
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    }
  };
}
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = global.DOMMatrix;
}

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
