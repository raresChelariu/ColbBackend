const url = require('url')
const Utils = require("./Utils");

class RequestEntity {
    #InternalReq
    Path
    HttpMethod
    QueryParams
    BodyRaw
    Body
    UnsupportedRequestMessage = null

    constructor(req) {
        this.#InternalReq = req;
    }

    async Init() {
        this.HttpMethod = this.#InternalReq.method;
        let urlParsed = url.parse(this.#InternalReq.url, true);

        this.Path = urlParsed.pathname;
        if (this.Path[-1] === '/')
            this.Path = this.Path.slice(0, -1);

        this.QueryParams = urlParsed.query;
        let bodyRaw = await this.#ExtractBodyRaw();
        this.BodyRaw = bodyRaw;
        this.Body = Utils.IsStringValidJSON(bodyRaw) ? JSON.parse(bodyRaw) : undefined;
    }

    async #ExtractBodyRaw() {
        return new Promise((resolve) => {
            let data = '';
            this.#InternalReq.on('data', chunk => {
                data += chunk;
            })
            this.#InternalReq.on('end', () => {
                resolve(data);
            })
        });
    }
    GetHeaders() {
        return this.#InternalReq.headers;
    }
}

module.exports = RequestEntity;
