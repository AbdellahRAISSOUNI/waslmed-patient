import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    console.log('🔄 Reusing existing MongoDB connection');
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    const db = await mongoose.connect(MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected Successfully');
    
    // Log database information if connection is established
    if (db.connection && db.connection.db) {
      try {
        const admin = db.connection.db.admin();
        const dbInfo = await admin.listDatabases();
        console.log('📂 Available databases:', dbInfo.databases.map(db => db.name).join(', '));
        
        // Get current database name from connection string
        const dbName = MONGODB_URI!.split('/').pop()?.split('?')[0];
        console.log(`🏢 Connected to database: ${dbName}`);
      } catch (err) {
        console.log('ℹ️ Could not list databases (might not have admin privileges)');
      }
    }
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 