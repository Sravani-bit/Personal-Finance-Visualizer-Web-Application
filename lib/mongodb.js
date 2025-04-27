import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sravanichennareddy01:c8uYA1XXkjf9RYiG@cluster0.ijgqtll.mongodb.net/personal-finance";

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    cached.promise = mongoose.connect(MONGODB_URI).then(() => console.log("Database Connected")).catch((error) => console.log(error));
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;