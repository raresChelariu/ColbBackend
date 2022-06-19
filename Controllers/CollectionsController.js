const Router = require('./../Routing/Router')
const Validation = require("../Middleware/Validation");
const CollectionRepository = require("../DataAccess/MariaDB/CollectionRepository");
const router = new Router();
const JwtMiddleware = require("../Middleware/JwtMiddleware");
const Utils = require("../DataAccess/MariaDB/Utils");
const DatabaseErrorCodes = require("../DataAccess/MariaDB/DatabaseErrorCodes");
const FilterHelper = require("./FilterHelper");

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
    },
    CollectionAddBottleToCollection: {
        'id': '/AddBottleToCollection',
        'type': 'object',
        'properties': {
            'CollectionID': {'type': 'number'},
            'BottleID': {'type': 'number'}
        },
        'required': ['CollectionID', 'BottleID']
    },
    CollectionBottlesGetByFilters: {
        'id': '/BottlesGetByFiltersForCollectionID',
        'type': 'object',
        'properties': {
            'collectionID': {'type': 'string', 'pattern': /[1-9]+\d*/},
            'name': {'type': 'string'},
            'priceMin': {'type': 'string', 'pattern': /^\d+(\.\d*)?$/},
            'priceMax': {'type': 'string', 'pattern': /^\d+(\.\d*)?$/},
            'country': {'type': 'string'},
            'label': {'type': 'string'},
            'createdDateTimeStart': {'type': 'date'},
            'createdDateTimeEnd': {'type': 'date'},
            'orderColumn': {'type': 'string'},
            'orderDirection': {'type': 'string'},
            'indexStart': {'type': 'string', 'pattern': /[1-9]+\d*/},
            'indexEnd': {'type': 'string', 'pattern': /[1-9]+\d*/},
            'exportType': {'type': 'string'}
        },
        required: ['collectionID']
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
            res.CreatedJSON(result);
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
            AccountID: Number(req.Account.ID)
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
router.Post('/bottles',
    JwtMiddleware.AuthorizedRequest,
    Validation.ValidateBody(Schemas.CollectionAddBottleToCollection),
    (req, res) => {
        CollectionRepository.AddBottleToCollection(req.Account.ID, req.Body.CollectionID, req.Body.BottleID)
            .then((result) => {
                res.CreatedJSON(result);
            })
            .catch(error => {
                if (error.code === DatabaseErrorCodes.DUPLICATE_ENTRY.DatabaseName) {
                    res.BadRequest(DatabaseErrorCodes.DUPLICATE_ENTRY.ClientName);
                    return;
                }
                if (error.code === DatabaseErrorCodes.BUSINESS_ERROR.DatabaseName) {
                    res.BadRequest(error.text);
                    return;
                }
                res.InternalServerError(error);
            });
    }
);

router.Get('/bottles/filter', JwtMiddleware.AuthorizedRequest,
    Validation.ValidateQueryString(Schemas.CollectionBottlesGetByFilters),
    (req, res) => {

        const filter = FilterHelper.GetFilterForBottles(req);
        CollectionRepository.CollectionBottlesGetByFilters(req.Account.ID, req.QueryParams.collectionID, filter.Name, filter.PriceMin, filter.PriceMax,
            filter.Country, filter.Label, filter.CreatedDateTimeStart, filter.CreatedDateTimeEnd)
            .then((result) => {
                FilterHelper.FilterHelperForBottles(req, res, result, filter);
            })
            .catch((error) => {
                if (error.code === DatabaseErrorCodes.BUSINESS_ERROR.DatabaseName) {
                    res.BadRequest(error.text);
                    return;
                }
                res.InternalServerError(error);
            });
    }
);

module.exports = router;