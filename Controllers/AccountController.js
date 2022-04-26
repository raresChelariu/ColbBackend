const Router = require('./../Routing/Router')
const Validation = require("../Middleware/Validation");
const AccountRepository = require("../DataAccess/AccountRepository");
const router = new Router();

const Schemas = {
    AccountRegister: {
        'id': '/AccountRegisterRequest',
        'type': 'object',
        'properties': {
            'Email': {'type': 'string', 'pattern': /\w+@\w+.\w/},
            'FirstName': {'type': 'string'},
            'LastName': {'type': 'string'},
            'Password': {'type': 'string'}
        },
        'required': ['Email', 'FirstName', 'LastName', 'Password']
    }
}

router.Get('/', (req, res) => {
    res.ContentPlain('We got to accounts');
});


router.Post('/register',
    Validation.ValidateBody(Schemas.AccountRegister),
    (req, res) => {
        AccountRepository.Register(req.Body.Email, req.Body.FirstName, req.Body.LastName, req.Body.Password)
            .then(() => {
                res.CreatedJSON(`acc created with ${req.Body.Email}`);
            })
            .catch((error) => {
                res.InternalServerError({error: error.toString()})
            });
    }
);

module.exports = router;