// Test script for authentication system
// Run this after starting the server to test all endpoints

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    phone: '+1234567890'
};

let authToken = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        console.log(`\n📡 ${method} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        return { response, result };
    } catch (error) {
        console.error(`❌ Error calling ${endpoint}:`, error.message);
        return { error };
    }
}

// Test functions
async function testRegistration() {
    console.log('\n🔐 Testing User Registration...');
    const { result } = await apiCall('/auth/register', 'POST', testUser);
    
    if (result && result.success) {
        console.log('✅ Registration successful');
        return true;
    } else {
        console.log('❌ Registration failed');
        return false;
    }
}

async function testLogin() {
    console.log('\n🔑 Testing User Login...');
    const { result } = await apiCall('/auth/login', 'POST', {
        email: testUser.email,
        password: testUser.password
    });
    
    if (result && result.success) {
        authToken = result.token;
        console.log('✅ Login successful');
        console.log(`Token: ${authToken.substring(0, 20)}...`);
        return true;
    } else {
        console.log('❌ Login failed');
        return false;
    }
}

async function testProfile() {
    console.log('\n👤 Testing Get Profile...');
    const { result } = await apiCall('/auth/profile', 'GET', null, authToken);
    
    if (result && result.success) {
        console.log('✅ Profile retrieved successfully');
        return true;
    } else {
        console.log('❌ Profile retrieval failed');
        return false;
    }
}

async function testVerifyToken() {
    console.log('\n🔍 Testing Token Verification...');
    const { result } = await apiCall('/auth/verify', 'GET', null, authToken);
    
    if (result && result.success) {
        console.log('✅ Token verification successful');
        return true;
    } else {
        console.log('❌ Token verification failed');
        return false;
    }
}

async function testForgotPassword() {
    console.log('\n📧 Testing Forgot Password...');
    const { result } = await apiCall('/auth/forgot-password', 'POST', {
        email: testUser.email
    });
    
    if (result && result.success) {
        console.log('✅ Forgot password request successful');
        console.log('📧 Check your email for reset instructions');
        return true;
    } else {
        console.log('❌ Forgot password request failed');
        return false;
    }
}

async function testInvalidLogin() {
    console.log('\n🚫 Testing Invalid Login...');
    const { result } = await apiCall('/auth/login', 'POST', {
        email: testUser.email,
        password: 'wrongpassword'
    });
    
    if (result && !result.success) {
        console.log('✅ Invalid login correctly rejected');
        return true;
    } else {
        console.log('❌ Invalid login should have been rejected');
        return false;
    }
}

async function testProtectedRouteWithoutToken() {
    console.log('\n🔒 Testing Protected Route Without Token...');
    const { result } = await apiCall('/auth/profile', 'GET');
    
    if (result && !result.success) {
        console.log('✅ Protected route correctly rejected without token');
        return true;
    } else {
        console.log('❌ Protected route should have been rejected');
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Authentication System Tests');
    console.log('==========================================');
    
    const tests = [
        { name: 'Registration', fn: testRegistration },
        { name: 'Login', fn: testLogin },
        { name: 'Get Profile', fn: testProfile },
        { name: 'Verify Token', fn: testVerifyToken },
        { name: 'Forgot Password', fn: testForgotPassword },
        { name: 'Invalid Login', fn: testInvalidLogin },
        { name: 'Protected Route Without Token', fn: testProtectedRouteWithoutToken }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const success = await test.fn();
            if (success) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ Test ${test.name} threw an error:`, error.message);
            failed++;
        }
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the server logs and configuration.');
    }
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
    console.log('❌ This test script requires Node.js 18+ with fetch support');
    console.log('💡 Alternatively, you can test the endpoints manually using curl or Postman');
    console.log('\n📋 Manual Testing Commands:');
    console.log('curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d \'{"name":"Test User","email":"test@example.com","password":"TestPass123!"}\'');
    console.log('curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"email":"test@example.com","password":"TestPass123!"}\'');
    console.log('curl -X GET http://localhost:3000/auth/profile -H "Authorization: Bearer YOUR_TOKEN_HERE"');
} else {
    // Run the tests
    runTests().catch(console.error);
}
