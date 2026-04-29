import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { Threshold } from '../models/Threshold';
import { Alert } from '../models/Alert';
import { Streak } from '../models/Streak';
import { seedIfEmpty } from './seedHelper';

const main = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Activity.deleteMany({}),
    Threshold.deleteMany({}),
    Alert.deleteMany({}),
    Streak.deleteMany({}),
  ]);
  await seedIfEmpty();
  console.log('✅ Done');
  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
