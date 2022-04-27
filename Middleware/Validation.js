const Validator = require('jsonschema').Validator;

class RequestParametersValidation {
    static ValidateObject(obj, schema) {
        let validator = new Validator();
        return validator.validate(obj, schema);
    }

    static ValidateBody(schema) {
        return (req, res) => {
            if (!req.Body) {
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
}

module.exports = RequestParametersValidation;