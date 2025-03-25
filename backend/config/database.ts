import mongoose from 'mongoose';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {}

  public static async connect(): Promise<typeof mongoose> {
    try {
      const connection = await mongoose.connect(process.env.MONGODB_URI || '', {
        retryWrites: true,
        w: 'majority'
      });

      console.log('MongoDB connected successfully');
      return connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  }
}

export default DatabaseConnection;