const Utils = require("./Utils");

class ResponseEntity {
    static #DefaultMediaTypes = {
        'PLAIN': 'text/plain',
        'JSON': 'application/json'
    };
    #InternalRes;

    constructor(res) {
        this.#InternalRes = res;
    }

    InternalServerError(content) {
        this.#InternalRes.writeHead(500).end(JSON.stringify(content));
    }

    ContentPlain(content) {
        this.Content(content, ResponseEntity.#DefaultMediaTypes.PLAIN);
    }

    ContentJSON(content) {
        if (!(typeof content === 'string'))
        {
            // received an object => convert it to JSON string
            this.Content(JSON.stringify(content), ResponseEntity.#DefaultMediaTypes.JSON);
            return;
        }
        // received a string => if not JSON parsable, throw 501 Internal Server Error
        if (!Utils.IsStringValidJSON(content))
        {
            console.log(`Invalid JSON. Given JSON for Response : ${content}`)
            this.InternalServerError();
            return;
        }
        this.Content(content, ResponseEntity.#DefaultMediaTypes.JSON);
    }

    Content(content, mediaType) {
        this.#InternalRes.writeHead(200, {'Content-Type': mediaType}).end(content);
    }
    Created(content, mediaType) {
        this.#InternalRes.writeHead(201, {'Content-Type': mediaType}).end(content);
    }
    CreatedJSON(content) {
        this.Created(content, ResponseEntity.#DefaultMediaTypes.JSON);
    }
    BadRequest(errorMessage = null) {
        this.#InternalRes.writeHead(400).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }

    Unauthorized(errorMessage = null) {
        this.#InternalRes.writeHead(401).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }

    NotFound(res, errorMessage = null) {
        this.#InternalRes.writeHead(404).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }
}

module.exports = ResponseEntity;