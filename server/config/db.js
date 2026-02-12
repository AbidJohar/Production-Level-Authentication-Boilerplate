import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();


const connectDB = async () => {
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI not set in .env');
try {
await mongoose.connect(uri, {
// useNewUrlParser and useUnifiedTopology are default in Mongoose 7+
});
console.log('MongoDB connected');
} catch (err) {
console.error('MongoDB connection error:', err.message);
process.exit(1);
}
};


export default connectDB;