const Router = require('./../Routing/Router')
const Validation = require("../Middleware/Validation");
const CollectionRepository = require("../DataAccess/MariaDB/CollectionRepository");
const router = new Router();
const JwtMiddleware = require("../Middleware/JwtMiddleware");
const Utils = require("../DataAccess/MariaDB/Utils");

const Schemas = {
    CollectionAdd: {
        'id': '/CollectionAdd',
        'type': 'object',
        'properties': {
            'Name': {'type': 'string'},
            'Description': {'type': 'string'}
        },
        'required': ['Name', 'Description']
    },
    CollectionsGetByFilters: {
        'id': '/GetByFiltersForAccountID',
        'type': 'object',
        'properties': {
            'name': {'type': 'string'},
            'description': {'type': 'string'},
            'inputDateTimeStart': {'type': 'date'},
            'inputDateTimeEnd': {'type': 'date'}
        }
    }
}


router.Post('/',
    JwtMiddleware.AuthorizedRequest,
    Validation.ValidateBody(Schemas.CollectionAdd),
    (req, res) => {
        if (Number.isNaN(req.Account.ID)) {
            res.BadRequest(`No valid ID for account is provided. Account ID: ${req.Account.ID}`);
            return;
        }
        CollectionRepository.Add(req.Body.Name, req.Body.Description, req.Account.ID).then((result) => {
            console.log(result);
            res.CreatedJSON({'Name': req.Body.Name, 'Description': req.Body.Description, 'ID': req.Account.ID});
        }).catch(err => {
            res.InternalServerError(err);
        });
    }
);

router.Get('/byfilters',
    JwtMiddleware.AuthorizedRequest,
    Validation.ValidateQueryString(Schemas.CollectionsGetByFilters),
    (req, res) => {
        if (Number.isNaN(req.Account.ID)) {
            res.BadRequest(`No valid ID for account is provided. Account ID: ${req.Account.ID}`);
            return;
        }
        const DATETIME_MIN = '1000-01-01';
        const DATETIME_MAX = '9999-12-31';
        const filter = {
            Name: Utils.DefaultForStringField(req.QueryParams.name),
            Description: Utils.DefaultForStringField(req.QueryParams.description),
            InputDateTimeStart: Utils.DefaultForDateTimeField(req.QueryParams.inputDateTimeStart, DATETIME_MIN),
            InputDateTimeEnd: Utils.DefaultForDateTimeField(req.QueryParams.inputDateTimeEnd, DATETIME_MAX),
            AccountID: req.Account.ID
        };
        CollectionRepository.GetByFiltersForAccountID(filter.AccountID, filter.Name, filter.Description, filter.InputDateTimeStart, filter.InputDateTimeEnd)
            .then(result => {
                res.ContentJSON(result);
            })
            .catch(err => {
                    res.InternalServerError(err);
                }
            );

    }
);

router.Get('/getcsvtest',
    (req, res) => {
        const myCars = [
            {
                "car": "Audi",
                "price": 40000,
                "color": "blue"
            }, {
                "car": "BMW",
                "price": 35000,
                "color": "black"
            }, {
                "car": "Porsche",
                "price": 60000,
                "color": "green"
            }
        ];
        const mappingForCSVExport = {
            'car': 'CarName',
            'price': 'CarPrice',
            'color': 'ColorOfCar'
        };
        const fileName = 'test.csv';
        res.SendListOfObjectsAsCSV(myCars, mappingForCSVExport, fileName);
    }
);

router.Get('/getpdftest',
    (req, res) => {
        const myCars = [
            {
                "car": "Audi",
                "price": 40000,
                "color": "blue"
            }, {
                "car": "BMW",
                "price": 35000,
                "color": "black"
            }, {
                "car": "Porsche",
                "price": 60000,
                "color": "green"
            }
        ];
        const mappingForCSVExport = {
            'car': 'CarName',
            'price': 'CarPrice',
            'color': 'ColorOfCar'
        };
        const pdfTitle = 'Here is the PDF TITLE';
        const pdfFilename = 'hello.pdf';
        res.SendListOfObjectsAsPdf(myCars, mappingForCSVExport, pdfFilename, pdfTitle);
    }
);


module.exports = router;