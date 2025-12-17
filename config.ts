// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
// Set this to FALSE to connect to your real Node.js backend.
// Set this to TRUE to use the in-browser simulation.
export const USE_MOCK_SERVICE = true;

// Your Backend URL (e.g., http://localhost:3000 or your production IP)
export const API_BASE_URL = 'http://localhost:3000';
export const WS_BASE_URL = 'ws://localhost:3000';

// Signal Protocol specific constants would go here
export const SIGNAL_SERVER_URL = `${API_BASE_URL}/v1/keys`;
