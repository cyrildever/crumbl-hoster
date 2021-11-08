import express, { Router } from 'express'
import mongo from 'mongodb'
import { Maybe, None, Some } from 'monet'
import * as crumbljs from 'crumbl-js'

import { Crumbl, insertCrumbl } from '../model/Crumbl'
import { logger } from '../utils/logger'

export type HosterController = Router

export default (collection: mongo.Collection<Crumbl>): HosterController => {
  const router = express.Router()

  /* GET crumbl. */
  router.get('/crumbl', (req, res, _) => {
    if ('hasheredSrc' in req.query && 'token' in req.query) {
      collection
        .findOne({ hasheredSrc: req.query.hasheredSrc as string } as Crumbl, { projection: { _id: 0 } })
        .then(item => {
          if (item === null) {
            res.sendStatus(404).end()
          } else {
            // TODO Record
            logger.info(`Crumbl found for ${req.ip} with token ${req.query.token as string}`)
            res.json(item)
          }
        })
        .catch(err => {
          logger.error(err)
          res.sendStatus(500).end()
        })
    } else {
      res.sendStatus(400).end()
    }
  })

  /* POST crumbl. */
  router.post('/crumbl', (req, res, _) => {
    const maybeCrumbl = extractData(req.body as string)
    if (maybeCrumbl.isSome()) {
      const crumbl = maybeCrumbl.some()
      insertCrumbl(collection, crumbl)
        .then(r => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (r.result.n > 0) {
            logger.info(`Crumbl recorded from ${req.ip}`) // TODO Use X-User-ID header instead to monitor activity
            res.status(201).send(crumbl.hasheredSrc)
          } else {
            res.sendStatus(500).end()
          }
        })
        .catch(err => {
          logger.error(err)
          res.sendStatus(500).end()
        })
    } else {
      res.sendStatus(400).end()
    }
  })

  /* Catch all */
  router.get('/', (_, res) => res.sendStatus(404).end())
  router.post('/', (_, res) => res.sendStatus(404).end())

  return router
}

const extractData = (body: string): Maybe<Crumbl> => {
  if (body.length !== undefined && body.length !== 0) {
    try {
      const hasheredSrc = crumbljs.getHasheredSrc(body)
      const crumbl: Crumbl = {
        hasheredSrc: hasheredSrc,
        crumbled: body
      }
      return Some(crumbl)
    } catch (e) {
      logger.error(e)
    }
  }
  return None<Crumbl>()
}
