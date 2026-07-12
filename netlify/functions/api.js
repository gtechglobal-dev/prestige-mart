const serverless = require('serverless-http')
const app = require('../../backend/src/index')
const connectDB = require('../../backend/src/utils/db')

let handler

exports.handler = async (event, context) => {
  await connectDB()

  if (!handler) {
    handler = serverless(app, {
      request: (request) => {
        const path = event.path.replace('/.netlify/functions/api', '') || '/'
        request.url = '/api' + path
      }
    })
  }

  return handler(event, context)
}
