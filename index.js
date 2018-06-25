'use strict'

const async = require('asyncnc')
const _ = require('lodash')
const Base = require('bfx-facs-base')
const Redlock = require('redlock')

function redlock (conf, redisClient) {
  const redlock = new Redlock([redisClient], _.extend(
    {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200
    }, conf
  ))
  return redlock
}

class RedLockFacility extends Base {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'redis-lock'
    this._hasConf = true

    this.init()
  }

  _start (cb) {
    async.series([
      next => { super._start(next) },
      next => {
        this.redisLock = redlock(this.conf, this.opts.redis_client)
        next()
      }
    ], cb)
  }

  _stop (cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        this.redisLock.quit(next)
      },
      next => {
        delete this.redisLock
        delete this.redisCluster
        next()
      }
    ], cb)
  }
}

module.exports = RedLockFacility
