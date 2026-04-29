import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  const useMemory = process.env.USE_MEMORY_DB === 'true';
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carbon_twin';

  if (useMemory) {
    memServer = await MongoMemoryServer.create();
    uri = memServer.getUri();
  }

  await mongoose.connect(uri);
  return uri;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
};
