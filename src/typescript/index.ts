import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import bodyParser from 'body-parser'
import config from 'config'
import mongo from 'mongodb'
import * as crumbljs from 'crumbl-js'

import HosterController from './controller/HosterController'
import { logger } from './utils/logger'

const main = async (): Promise<void> => {
  logger.info('Starting hoster server...')

  const mongoUserName = config.get<string>('mongo.username')
  const mongoPassword = config.get<string>('mongo.password')
  const mongoDomain = config.get<string>('mongo.domain')
  const mongoPort = config.get<number>('mongo.port')
  const mongoDB = config.get<string>('mongo.db')
  const mongoCollection = config.get<string>('mongo.collection')
  const url = `mongodb://${mongoUserName}:${mongoPassword}@${mongoDomain}:${mongoPort}`
  const connection = await mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const collection = connection.db(mongoDB).collection(mongoCollection)
  collection.stats()
    .then(stats => logger.info(`Hosting ${stats.count} crumbls in database`))
    .catch(err => logger.error(err))

  const hosterController = HosterController(collection)
  const port = config.get('http.port')
  express()
    .use(helmet(), compression())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.text())
    .use((req, _, next) => {
      if (req.method === 'POST') {
        try {
          logger.info(`Receiving POST request for ${req.originalUrl} with body "${req.body.substring(0, crumbljs.DEFAULT_HASH_LENGTH)}[...]" from ${req.ip}`)
        } catch (e) {
          logger.warn(`Receiving invalid POST request for ${req.originalUrl} from ${req.ip}`)
        }
      } else {
        logger.info(`Receiving ${req.method} request for ${req.originalUrl} from ${req.ip}`)
      }
      next()
    })
    .use('/', hosterController)
    .listen(port, () =>
      logger.info(`Listening at http://localhost:${port}/`)
    )
}

main().catch(err => logger.fatal(err))
