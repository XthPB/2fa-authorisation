// import mongoose from "mongoose";

// import { MongoMemoryServer } from "mongodb-memory-server";
// import ENV from '../config.js'

// async function connect(){

//     const mongod = await MongoMemoryServer.create();
//     const getUri = mongod.getUri();

//     mongoose.set('strictQuery', true)
//     // const db = await mongoose.connect(getUri);
//     const db = await mongoose.connect(ENV.ATLAS_URI);
//     console.log("Database Connected")
//     return db;
// }

// export default connect;

import mongoose from "mongoose";
import ENV from '../config.js'

async function connect(){
    // Remove the creation of MongoMemoryServer
    // const mongod = await MongoMemoryServer.create();
    // const getUri = mongod.getUri();

    mongoose.set('strictQuery', true)
    
    // Use your MongoDB Atlas URI here
    const db = await mongoose.connect(ENV.ATLAS_URI);
    console.log("Database Connected")
    return db;
}

export default connect;
