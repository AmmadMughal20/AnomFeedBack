import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>
{
    if (connection.isConnected)
    {
        console.log('Already connected!')
        return
    }
    try
    {
        const db = await mongoose.connect(process.env.MONGO_DB_URI || "", {})
        connection.isConnected = db.connections[0].readyState
        console.log(db.connections, 'printing db connections')
        console.log("DB connected successfully")
    } catch (e)
    {
        console.log("DB connection failed: ", e)
        process.exit()
    }
}

export default dbConnect;