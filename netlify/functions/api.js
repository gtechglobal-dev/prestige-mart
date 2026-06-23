const serverless = require('serverless-http')
const app = require('../../backend/src/index')

const handler = serverless(app, {
  request: (request, event) => {
    request.url = event.path.replace('/.netlify/functions/api', '/api') || '/api'
  }
})

exports.handler = handler
