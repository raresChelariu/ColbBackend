const mariadb = require('mariadb')

class BaseRepository {
    // @ts-ignore
    static #Connection() {
        return mariadb.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_SCHEMA,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });
    }

    static Query(query) {
        return new Promise((resolve, reject) => {
            BaseRepository.#Connection()
                .then(conn => {
                    conn.query(query)
                        .then(async result => {
                            // for SELECT queries (they include the 'meta' key)
                            if (Object.keys(result).includes('meta'))
                            {
                                // delete meta key - no need for it
                                delete result['meta'];
                            }
                            await resolve(result[0]);
                            conn.destroy();
                        })
                        .catch(err => reject(err))
                })
                .catch((err) => reject(err))
        });
    }

}

module.exports = BaseRepository