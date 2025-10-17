const SUPPORTED_STATES = Object.freeze([ "pending_initialized", "pending_queued", "active_exiting", "active_ongoing", "exited_unslashed", "withdrawal_done", "withdrawal_possible" ]);
const SUPPORTED_CHAINS = Object.freeze([ "ethereum", "gnosis" ]);

module.exports = { SUPPORTED_STATES, SUPPORTED_CHAINS };