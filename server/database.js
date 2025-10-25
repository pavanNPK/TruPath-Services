import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.DB_URL; // ✅ Use DB_URL from .env
        
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        };

        const conn = await mongoose.connect(mongoURI, options);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        mongoose.connection.on('error', (err) => console.error('❌ MongoDB Error:', err));
        mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
        mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed gracefully');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
