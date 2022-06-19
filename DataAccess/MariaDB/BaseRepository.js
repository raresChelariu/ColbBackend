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
                            if (result[0] === undefined) {
                                await resolve({});
                                conn.destroy();
                                return;
                            }
                            let queryResult = result[0];
                            if (queryResult.length === undefined || queryResult.length === null || queryResult.length === 0) {
                                await resolve(queryResult);
                                conn.destroy();
                                return;
                            }
                            // cannot stringify object with properties of type bigint
                            // so we convert bigint properties to int
                            for (let i = 0; i < queryResult.length; i++) {
                                let keys = Object.keys(queryResult[i]);
                                for (let j = 0; j < keys.length; j++) {
                                    if (typeof queryResult[i][keys[j]] === 'bigint') {
                                        queryResult[i][keys[j]] = parseInt(queryResult[i][keys[j]]);
                                    }
                                }
                            }
                            await resolve(queryResult);
                            conn.destroy();
                        })
                        .catch(err => reject(err))
                })
                .catch((err) => reject(err))
        });
    }

}

module.exports = BaseRepository