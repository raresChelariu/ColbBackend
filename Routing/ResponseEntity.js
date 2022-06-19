const Utils = require("./Utils");

const HEADER_KEY_CONTENT_TYPE = 'Content-Type';
const HEADER_KEY_CONTENT_DISPOSITION = 'Content-Disposition';
class ResponseEntity {
    static #DefaultMediaTypes = {
        'PLAIN': 'text/plain',
        'JSON': 'application/json',
        'FILE': 'application/octet-stream',
        XML: 'application/xml'
    };
    #InternalRes;

    constructor(res) {
        this.#InternalRes = res;
        // Add CORS headers
        this.#InternalRes.setHeader('Access-Control-Allow-Origin', '*');
        this.#InternalRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        this.#InternalRes.setHeader('Access-Control-Allow-Headers', HEADER_KEY_CONTENT_TYPE);
        this.#InternalRes.setHeader('Access-Control-Allow-Credentials', true);
    }

    InternalServerError(content) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.JSON);
        this.#InternalRes.writeHead(500).end(JSON.stringify(content));
    }

    ContentPlain(content) {
        this.Content(content, ResponseEntity.#DefaultMediaTypes.PLAIN);
    }

    ContentJSON(content) {
        try {
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
        catch(exception) {
            this.InternalServerError({error: exception.toString()})
        }
    }
    ContentXML(content) {
        this.Content(content, ResponseEntity.#DefaultMediaTypes.XML);
    }
    Content(content, mediaType) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, mediaType);
        this.#InternalRes.writeHead(200, { HEADER_KEY_CONTENT_TYPE : mediaType}).end(content);
    }
    Created(content, mediaType) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, mediaType);
        this.#InternalRes.writeHead(201).end(content);
    }
    CreatedJSON(content, isAlreadyStringified = false) {
        if (isAlreadyStringified === false) {
            this.Created(JSON.stringify(content, null, 2), ResponseEntity.#DefaultMediaTypes.JSON);
            return;
        }
        this.Created(content, ResponseEntity.#DefaultMediaTypes.JSON);
    }
    BadRequest(errorMessage = null) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.JSON);
        this.#InternalRes.writeHead(400).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }

    Unauthorized(errorMessage = null) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.JSON);
        this.#InternalRes.writeHead(401).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }

    NotFound(res, errorMessage = null) {
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.JSON);
        this.#InternalRes.writeHead(404).end(errorMessage == null ? '' : JSON.stringify({error: errorMessage}));
    }

    SendListOfObjectsAsCSV(objectList, mapperPropertyToCSVFieldName, fileName) {
        if (objectList === null || objectList === undefined || // no object
            objectList.length === null || objectList.length === undefined || // object, but not array
            objectList.length === 0 // array, but empty array
        ) {
            this.BadRequest(`No objects to be exported as CSV!`);
            return;
        }
        let propertiesFromObjectList = Object.keys(objectList[0]);
        let propertiesFromMapper = Object.keys(mapperPropertyToCSVFieldName);
        if (!Utils.StringArraysAreEqual(propertiesFromObjectList, propertiesFromMapper)) {
            this.InternalServerError({error: 'Properties for CSV generation do not match!'});
            return;
        }
        const contentOfCsv = Utils.CreateCSVAsString(objectList, mapperPropertyToCSVFieldName);
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.FILE);
        this.SetHeader(HEADER_KEY_CONTENT_DISPOSITION, `attachment; filename=${fileName}`);
        this.#InternalRes.end(contentOfCsv);
    }
    SendListOfObjectsAsPDF(objectList, mapperPropertyToCSVFieldName, fileName, titleOfPDF) {
        if (titleOfPDF === null || titleOfPDF === undefined || // no object
            titleOfPDF === '' || !titleOfPDF.trim() // empty or whitespace string
        ) {
            this.InternalServerError({error: 'Must provide title for PDF generation!'});
            return;
        }
        if (objectList === null || objectList === undefined || // no object
            objectList.length === null || objectList.length === undefined || // object, but not array
            objectList.length === 0 // array, but empty array
        ) {
            this.BadRequest(`No objects to be exported as PDF!`);
            return;
        }
        let propertiesFromObjectList = Object.keys(objectList[0]);
        let propertiesFromMapper = Object.keys(mapperPropertyToCSVFieldName);
        if (!Utils.StringArraysAreEqual(propertiesFromObjectList, propertiesFromMapper)) {
            this.InternalServerError({error: 'Properties for PDF generation do not match!'});
            return;
        }
        const contentOfCsv = Utils.CreateCSVAsString(objectList, mapperPropertyToCSVFieldName);
        this.SetHeader(HEADER_KEY_CONTENT_TYPE, ResponseEntity.#DefaultMediaTypes.FILE);
        this.SetHeader(HEADER_KEY_CONTENT_DISPOSITION, `attachment; filename=${fileName}`);
        Utils.CreatePDFInStream(
            titleOfPDF,
            contentOfCsv,
            (chunk) => this.#InternalRes.write(chunk),
            () => this.#InternalRes.end()
        );
    }
    SetHeader(headerKey, headerValue) {
        this.#InternalRes.setHeader(headerKey, headerValue);
    }
}

module.exports = ResponseEntity;