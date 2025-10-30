// Passenger wrapper for ES Module application
// This file allows Phusion Passenger (used by Plesk) to load our ES module app

async function loadApp() {
  try {
    // Dynamically import the ES module
    await import('./dist/index.js');
    console.log('✅ NavetteClub application loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load application:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Start the application
loadApp();
