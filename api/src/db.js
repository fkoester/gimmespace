import mysql from 'promise-mysql'

let pool

async function getPool() {
  if (!pool) {
    pool = await mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: process.env.MYSQL_PORT || 62450,
      user: process.env.MYSQL_USER || 'gimmespace',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'gimmespace',
      supportBigNumbers: true,
    })
  }

  return pool
}

export default {
  query: async (...args) => (await getPool()).query(...args),
  getConnection: async (...args) => (await getPool()).getConnection(...args),
  releaseConnection: async (...args) => (await getPool()).releaseConnection(...args),
}
