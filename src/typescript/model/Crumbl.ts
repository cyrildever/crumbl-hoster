import mongo from 'mongodb'
import { logger } from '../utils/logger'

export interface Crumbl {
  hasheredSrc: string
  crumbled: string
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const insertCrumbl = (collection: mongo.Collection<Crumbl | any>, c: Crumbl): Promise<any> =>
  collection
    .updateOne({ hasheredSrc: c.hasheredSrc }, { $set: { crumbled: c.crumbled } }, { upsert: true })
    .catch(err => logger.error(err))
