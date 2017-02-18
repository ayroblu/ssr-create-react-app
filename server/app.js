require('ignore-styles')
require('babel-register')({ ignore: /\/(build|node_modules)\//, presets: ['react-app'] })

const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')

const react = require('react')
const reactDomServer = require('react-dom/server')
const reactRouter = require('react-router')

const routes = require('../src/routes').default()
const configureStore = require('../src/store').default
const Provider = require('react-redux').Provider



const app = express()

// Support Gzip
app.use(compression())

// Suport post requests with body data (doesn't support multipart, use multer)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Setup logger
app.use(morgan('combined'))

// Serve static assets
function universalLoader(req, res) {
  //res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
  const filePath = path.resolve(__dirname, '..', 'build', 'index.html')

  fs.readFile(filePath, 'utf8', (err, htmlData)=>{
    if (err) {
      console.error('err', err)
      return res.status(404).end()
    }
    reactRouter.match({ routes, location: req.url }, (err, redirect, ssrData) => {
      if(err) {
        console.error('huh err', err)
        return res.status(404).end()
      } else if(redirect) {
        res.redirect(302, redirect.pathname + redirect.search)
      } else if(ssrData) {
        let store = configureStore()
        const ReactApp = reactDomServer.renderToString(
          react.createElement(Provider, {store},
            react.createElement(reactRouter.RouterContext, ssrData)
          )
        )
        const RenderedApp = htmlData.replace('{{SSR}}', ReactApp)
        res.send(RenderedApp)
      } else {
        return res.status(404).end()
      }
    })
  })
}
app.use('/', universalLoader)
app.use(express.static(path.resolve(__dirname, '..', 'build')))

const api = require('./api')
app.use('/api', api)

// Always return the main index.html, so react-router render the route in the client
app.use('/', universalLoader)

module.exports = app
