// Test script for MongoDB connection and authentication system
// Run this after setting up MongoDB to test the database integration

import connectDB from './database.js';
import { registerUser, loginUser, getUserStats } from './auth.js';

const testUser = {
    name: 'MongoDB Test User',
    email: 'mongodb-test@example.com',
    password: 'MongoTest123!',
    phone: '+1234567890'
};

async function testMongoDBConnection() {
    console.log('🍃 Testing MongoDB Connection...');
    
    try {
        await connectDB();
        console.log('✅ MongoDB connection successful');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('\n👤 Testing User Registration with MongoDB...');
    
    try {
        const user = await registerUser(testUser);
        console.log('✅ User registration successful');
        console.log('User ID:', user._id);
        console.log('User Name:', user.name);
        console.log('User Email:', user.email);
        return user;
    } catch (error) {
        console.error('❌ User registration failed:', error.message);
        return null;
    }
}

async function testUserLogin(user) {
    console.log('\n🔑 Testing User Login with MongoDB...');
    
    try {
        const result = await loginUser(testUser.email, testUser.password);
        console.log('✅ User login successful');
        console.log('Token:', result.token.substring(0, 20) + '...');
        console.log('User Role:', result.user.role);
        return result;
    } catch (error) {
        console.error('❌ User login failed:', error.message);
        return null;
    }
}

async function testUserStats() {
    console.log('\n📊 Testing User Statistics...');
    
    try {
        const stats = await getUserStats();
        console.log('✅ User statistics retrieved');
        console.log('Total Users:', stats.totalUsers);
        console.log('Active Users:', stats.activeUsers);
        console.log('Verified Users:', stats.verifiedUsers);
        console.log('Recent Users (30 days):', stats.recentUsers);
        return stats;
    } catch (error) {
        console.error('❌ User statistics failed:', error.message);
        return null;
    }
}

async function testDatabaseOperations() {
    console.log('\n🔍 Testing Database Operations...');
    
    try {
        // Test database connection
        const connectionSuccess = await testMongoDBConnection();
        if (!connectionSuccess) {
            console.log('❌ Cannot proceed without database connection');
            return;
        }

        // Test user registration
        const user = await testUserRegistration();
        if (!user) {
            console.log('❌ Cannot proceed without user registration');
            return;
        }

        // Test user login
        const loginResult = await testUserLogin(user);
        if (!loginResult) {
            console.log('❌ Cannot proceed without user login');
            return;
        }

        // Test user statistics
        const stats = await testUserStats();
        if (!stats) {
            console.log('❌ User statistics test failed');
            return;
        }

        console.log('\n🎉 All MongoDB tests passed!');
        console.log('📋 Test Summary:');
        console.log('  ✅ Database connection established');
        console.log('  ✅ User registration working');
        console.log('  ✅ User login working');
        console.log('  ✅ User statistics working');
        console.log('  ✅ JWT token generation working');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
testDatabaseOperations().catch(console.error);
