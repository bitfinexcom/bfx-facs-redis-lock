# bfx-facs-redis-lock

## Development

```
git clone https://github.com/bitfinexcom/bfx-facs-redis-lock
cd bfx-facs-redis-lock
git remote add upstream https://github.com/bitfinexcom/bfx-facs-base

```

## Usage

In your service, run:

```
npm i --save https://github.com/bitfinexcom/bfx-facs-redis-lock
```

### Integration
RedisLock is a class that extends from Facility, the main class in bfx-facs-base.

This Facility encapsulates the **[node-redlock](https://github.com/mike-marcacci/node-redlock)** libary.

Redlock can use node redis, ioredis redis library to keep its client connections.

```js

// Instance an object
const RedLockFac = require('bfx-facs-redis-lock')
// Create a redis client (Redlock can use node redis, ioredis or any other compatible redis library to keep its client connections.)
const redisClient = require('redis').createClient(6379, 'redis1.example.com');
// Pass redis client to redlock
const redLockFac = new RedLockFac (caller, {
    redis_client : redisClient
}, ctx)

// Within a worker constructor

this.setInitFacs([
    // Start a Redis client First.
    ['fac', 'bfx-facs-redis', '0', '0',{}, -4],
    
    ['fac', 'bfx-facs-redis-lock', '0', '0', () => {
        // Pass a Redis client to Redis Lock Fac
        return {
            redis_client: this.redis_0.cli_rw
        }
    }, -3]
])

```
## Main functions

### `RedLockFac.redisLock.lock(resource, ttl, ?callback) => Promise<Lock>`
- `resource (string)` resource to be locked
- `ttl (number)` time in ms until the lock expires
- `callback (function)` callback returning:
	- `err (Error)`
	- `lock (Lock)`


### `RedLockFac.redisLock.unlock(lock, ?callback) => Promise`
- `lock (Lock)` lock to be released
- `callback (function)` callback returning:
	- `err (Error)`


### `RedLockFac.redisLock.extend(lock, ttl, ?callback) => Promise<Lock>`
- `lock (Lock)` lock to be extended
- `ttl (number)` time in ms to extend the lock's expiration
- `callback (function)` callback returning:
	- `err (Error)`
	- `lock (Lock)`


### `RedLockFac.redisLock.disposer(resource, ttl, ?unlockErrorHandler)`
- `resource (string)` resource to be locked
- `ttl (number)` time in ms to extend the lock's expiration
- `callback (function)` error handler called with:
	- `err (Error)`


### `RedLockFac.redisLock.quit(?callback) => Promise<*[]>`
- `callback (function)` error handler called with:
	- `err (Error)`
	- `*[]` results of calling `.quit()` on each client


### `Lock.unlock(?callback) => Promise`
- `callback (function)` callback returning:
	- `err (Error)`


### `Lock.extend(ttl, ?callback) => Promise<Lock>`
- `ttl (number)` time from now in ms to set as the lock's new expiration
- `callback (function)` callback returning:
	- `err (Error)`
	- `lock (Lock)`



## Usage
### Locking & Unlocking (Callbacks)

```js

// the string identifier for the resource you want to lock
var resource = 'locks:account:322456';

// the maximum amount of time you want the resource locked,
// keeping in mind that you can extend the lock up until
// the point when it expires
var ttl = 1000;

redlock.lock(resource, ttl, function(err, lock) {

	// we failed to lock the resource
	if(err) {
		// ...
	}

	// we have the lock
	else {


		// ...do something here...


		// unlock your resource when you are done
		lock.unlock(function(err) {
			// we weren't able to reach redis; your lock will eventually
			// expire, but you probably want to log this error
			console.error(err);
		});
	}
});

```

### Locking and Extending (Promises)

```js
redlock.lock('locks:account:322456', 1000).then(function(lock) {

	// ...do something here...

	// if you need more time, you can continue to extend
	// the lock as long as you never let it expire

	// this will extend the lock so that it expires
	// approximitely 1s from when `extend` is called
	return lock.extend(1000).then(function(lock){

		// ...do something here...

		// unlock your resource when you are done
		return lock.unlock()
		.catch(function(err) {
			// we weren't able to reach redis; your lock will eventually
			// expire, but you probably want to log this error
			console.error(err);
		});
	});
});

```
