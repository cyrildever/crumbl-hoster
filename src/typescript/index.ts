import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import config from 'config'
import { Collection, MongoClient } from 'mongodb'
import * as crumbljs from 'crumbl-js'

import HosterController from './controller/HosterController'
import { logger } from './utils/logger'
import { Crumbl } from './model/Crumbl'

const main = async (): Promise<void> => {
  logger.info('Starting hoster server...')

  const mongoUserName = config.get<string>('mongo.username')
  const mongoPassword = config.get<string>('mongo.password')
  const mongoDomain = config.get<string>('mongo.domain')
  const mongoPort = config.get<number>('mongo.port')
  const mongoDB = config.get<string>('mongo.db')
  const mongoCollection = config.get<string>('mongo.collection')
  const url = `mongodb://${mongoUserName}:${mongoPassword}@${mongoDomain}:${mongoPort}`
  const connection = await MongoClient.connect(url)
  const collection: Collection<Crumbl> = connection.db(mongoDB).collection(mongoCollection)
  collection.stats()
    .then(stats => logger.info(`Hosting ${stats.count} crumbls in database`))
    .catch(err => logger.error(err))

  const hosterController = HosterController(collection)
  const port = config.get('http.port')

  /* eslint-disable @typescript-eslint/restrict-template-expressions */
  express()
    .use(helmet(), compression())
    .use(express.urlencoded({ extended: true }))
    .use(express.text())
    .use((req, _, next) => {
      if (req.method === 'POST') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          logger.info(`Receiving POST request for ${req.originalUrl} with body "${req.body.substring(0, crumbljs.DEFAULT_HASH_LENGTH)}[...]" from ${req.ip}`)
        } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
  /* eslint-enable @typescript-eslint/restrict-template-expressions */
}

main().catch(err => logger.fatal(err))
