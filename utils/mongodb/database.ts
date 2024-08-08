import { MongoClient, type MongoClientOptions } from "mongodb";

const uri: string = process.env.MONGODB_URI || "";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

declare global {
	// Allow global `var` declarations in TypeScript
	var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
	// In development mode, use a global variable so the MongoClient is not constantly recreated
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production mode, it's best to not use a global variable
	client = new MongoClient(uri);
	clientPromise = client.connect();
}

export default clientPromise;
