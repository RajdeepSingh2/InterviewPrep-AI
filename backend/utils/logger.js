const log = (msg) => {
  console.log(`[${new Date().toISOString()}] INFO: ${msg}`);
};

const error = (msg) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${msg}`);
};

const warn = (msg) => {
  console.warn(`[${new Date().toISOString()}] WARN: ${msg}`);
};

module.exports = {
  log,
  error,
  warn
};
