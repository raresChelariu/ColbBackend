const Router = require('./../Routing/Router')
const Validation = require("../Middleware/Validation");
const AccountRepository = require("../DataAccess/AccountRepository");
const router = new Router();
const DatabaseErrorCodes = require('./../DataAccess/DatabaseErrorCodes');
const Jwt = require("../Middleware/JwtMiddleware");

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
    },
    AccountLogin: {
        'id': '/AccountPasswordRequest',
        'type': 'object',
        'properties': {
            'Email': {'type': 'string', 'pattern': /\w+@\w+.\w/},
            'Password': {'type': 'string'}
        },
        'required': ['Email', 'Password']
    }
}

router.Post('/register',
    Validation.ValidateBody(Schemas.AccountRegister),
    (req, res) => {
        AccountRepository.Register(req.Body.Email, req.Body.FirstName, req.Body.LastName, req.Body.Password)
            .then(() => {
                let payload = {
                    Email: req.Body.Email,
                    FirstName: req.Body.FirstName,
                    LastName: req.Body.LastName
                };
                let response = {
                    Account: payload,
                    Token: Jwt.Sign(payload)
                };
                res.ContentJSON(response);
            })
            .catch((error) => {
                if (error.code === DatabaseErrorCodes.DUPLICATE_ENTRY.DatabaseName) {
                    res.BadRequest(DatabaseErrorCodes.DUPLICATE_ENTRY.ClientName);
                    return;
                }
                res.InternalServerError({error: error.toString()})
            });
    }
);

router.Post('/login', Validation.ValidateBody(Schemas.AccountLogin), (req, res) => {
    console.log(req.Body);
    AccountRepository.Login(req.Body.Email, req.Body.Password).then((dbResult) => {
        if (!dbResult || dbResult.length === 0) {
            res.Unauthorized('Invalid credentials!');
            return;
        }
        let payload = dbResult[0];
        let response = {
            Account: payload,
            Token: Jwt.Sign(payload)
        };

        res.ContentJSON(response);
    }).catch((error) => {
        if (error.code === DatabaseErrorCodes.DUPLICATE_ENTRY.DatabaseName) {
            res.BadRequest(DatabaseErrorCodes.DUPLICATE_ENTRY.ClientName);
            return;
        }
        res.InternalServerError({error: error.toString()})
    });
})


module.exports = router;