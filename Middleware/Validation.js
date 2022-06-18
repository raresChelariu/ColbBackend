const Validator = require('jsonschema').Validator;

class RequestParametersValidation {
    static ValidateObject(obj, schema) {
        let validator = new Validator();
        return validator.validate(obj, schema);
    }

    static ValidateBody(schema) {
        return (req, res) => {
            if (req.Body === undefined || req.Body === null) {
                res.BadRequest("Invalid body!");
                return false;
            }

            let validation = RequestParametersValidation.ValidateObject(req.Body, schema);
            if (validation.valid === false) {
                res.BadRequest(validation.toString());
                return false;
            }
            return true;
        };
    }
    static ValidateQueryString(schema) {
        return (req, res) => {
            if (req.QueryParams === undefined || req.QueryParams === null) {
                res.BadRequest("No query params available!");
                return false;
            }

            let validation = RequestParametersValidation.ValidateObject(req.QueryParams, schema);
            if (validation.valid === false) {
                res.BadRequest(validation.toString());
                return false;
            }
            return true;
        };
    }
}

module.exports = RequestParametersValidation;