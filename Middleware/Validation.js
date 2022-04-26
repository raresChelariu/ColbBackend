const Validator = require('jsonschema').Validator;

class Validation {
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

            let validation = Validation.ValidateObject(req.Body, schema);
            if (validation.valid === false) {
                res.BadRequest(validation.toString());
                return false;
            }
            return true;
        };
    }
}

module.exports = Validation