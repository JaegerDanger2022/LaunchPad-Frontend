/**
 * Backend Connection Test Script
 * Run this to verify backend connectivity
 *
 * Usage: npx ts-node scripts/test-backend-connection.ts
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://launchpad-backend-production.up.railway.app/api';

async function testBackendConnection() {
  console.log('\n🔍 Testing Backend Connection...\n');
  console.log(`📍 Backend URL: ${API_URL}\n`);

  const endpoints = [
    { path: '', name: 'Root (should 404)' },
    { path: '/users/test', name: 'Users endpoint (should 404 - user not found)' },
    { path: '/dreams-crud?user_id=test&summary=true', name: 'Dreams CRUD endpoint' },
  ];

  for (const endpoint of endpoints) {
    const url = `${API_URL}${endpoint.path}`;
    try {
      console.log(`Testing: ${endpoint.name}`);
      console.log(`URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`✅ Status: ${response.status} ${response.statusText}`);

      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}\n`);
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
      console.log(`Error details:`, error);
      console.log('');
    }
  }

  console.log('\n✨ Test complete!\n');
}

testBackendConnection().catch(console.error);
