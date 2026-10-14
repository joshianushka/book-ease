import redis from 'redis'
const redisClient= redis.createClient({
    username: 'default',
    password: 'QlYO1mbbxSr0F4aglOD1EkaS1WbWib7G',
    socket: {
        host: 'accessible-retrosnug-exuberant-52232.db.redis.io',
        port: 19251
    }
})

export default redisClient;