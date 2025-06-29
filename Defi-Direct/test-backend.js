// Test script to verify backend endpoints
const BACKEND_URL = 'https://backend-cf8a.onrender.com';

async function testBackendEndpoints() {
    console.log('Testing backend endpoints...\n');

    // Test 1: Check if the backend is accessible
    try {
        const response = await fetch(`${BACKEND_URL}/api/schema/`);
        if (response.ok) {
            console.log('✅ Backend is accessible');
        } else {
            console.log('❌ Backend is not accessible');
        }
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
    }

    // Test 2: Test cross-chain transfers endpoint
    try {
        const response = await fetch(`${BACKEND_URL}/crosschain/cross-chain-transfers/`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Cross-chain transfers endpoint working');
            console.log(`   Found ${data.length || 0} transfers`);
        } else {
            console.log('❌ Cross-chain transfers endpoint failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Cross-chain transfers endpoint error:', error.message);
    }

    // Test 3: Test stats endpoint
    try {
        const response = await fetch(`${BACKEND_URL}/crosschain/cross-chain-transfers/stats/`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Stats endpoint working');
            console.log('   Stats:', data);
        } else {
            console.log('❌ Stats endpoint failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Stats endpoint error:', error.message);
    }

    // Test 4: Test user transfers endpoint (with a dummy address)
    try {
        const dummyAddress = '0x1234567890123456789012345678901234567890';
        const response = await fetch(`${BACKEND_URL}/crosschain/cross-chain-transfers/by_user_address/?userAddress=${dummyAddress}`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ User transfers endpoint working');
            console.log(`   Found ${data.length || 0} transfers for dummy user`);
        } else {
            console.log('❌ User transfers endpoint failed:', response.status);
        }
    } catch (error) {
        console.log('❌ User transfers endpoint error:', error.message);
    }

    console.log('\nBackend test completed!');
}

// Run the test
testBackendEndpoints(); 