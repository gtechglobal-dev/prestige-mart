const mongoose = require('mongoose')

let cached = null

const connectDB = async () => {
  if (cached && cached.connection.readyState === 1) {
    return cached
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set')
  }

  try {
    cached = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'pretigemart',
      bufferCommands: false,
    })
    console.log(`MongoDB connected: ${cached.connection.host}/${cached.connection.name}`)
    return cached
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw error
  }
}

module.exports = connectDB
