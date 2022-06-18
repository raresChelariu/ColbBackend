const Router = require('./../Routing/Router')
const JwtMiddleware = require("../Middleware/JwtMiddleware");
const Validation = require("../Middleware/Validation");
const BottleRepository = require("../DataAccess/MariaDB/BottleRepository");
const DatabaseErrorCodes = require("../DataAccess/MariaDB/DatabaseErrorCodes");
const Utils = require("../DataAccess/MariaDB/Utils");
const router = new Router();

const Schemas = {
    BottlesAdd: {
        'id': '/BottlesAdd',
        'type': 'object',
        'properties': {
            'Name': {'type': 'string'},
            'Price': {'type': 'decimal'},
            'Country': {'type': 'string'},
            'ImageUrl': {'type': 'string'},
            'Label': {'type': 'string'},
            'CreatedDateTime': {'type': 'datetime'}
        },
        'required': ['Name', 'Price', 'ImageUrl']
    },
    BottlesGetByFilters: {
        'id': '/BottlesGetByFilters',
        'type': 'object',
        'properties': {
            'name': {'type': 'string'},
            'priceMin': {'type': 'string', 'pattern': /^\d+(\.\d*)?$/},
            'priceMax': {'type': 'string', 'pattern': /^\d+(\.\d*)?$/},
            'country': {'type': 'string'},
            'label': {'type': 'string'},
            'createdDateTimeStart': {'type': 'date'},
            'createdDateTimeEnd': {'type': 'date'},
            'orderColumn': {'type': 'string'},
            'orderDirection': {'type': 'string'},
            'indexStart': {'type': 'number'},
            'indexEnd': {'type': 'number'},
            'exportType': {'type': 'string'}
        }
    }
};

const ExportMappingForBottleFilter = {
    'ID': 'ID',
    'Name': 'BottleName',
    'Price': 'Price of Bottle',
    'Country': 'Country of origin',
    'Label': 'Content of label',
    'ImageUrl': 'Image URL for bottle',
    'InputDateTime': 'Date when the bottle was added',
    'CreatedDateTime': 'Date of bottle fabrication'
};


router.Get('/', (req, res) => {
    res.ContentPlain('We got to bottles');
});

router.Get('/authroute', JwtMiddleware.AuthorizedRequest, (req, res) => {
    res.ContentPlain('Auth ok :)')
});

router.Get('/testing', (req, res) => {
    res.ContentJSON({message: 'it works guys', date: new Date()});
})

router.Post('/',
    Validation.ValidateBody(Schemas.BottlesAdd),
    (req, res) => {
        let bottle = {
            Name: req.Body.Name === undefined ? null : req.Body.Name,
            Price: req.Body.Price === undefined ? null : req.Body.Price,
            Country: req.Body.Country === undefined ? null : req.Body.Country,
            Label: req.Body.Label === undefined ? null : req.Body.Label,
            ImageUrl: req.Body.ImageUrl === undefined ? null : req.Body.ImageUrl,
            CreatedDateTime: req.Body.CreatedDateTime === undefined ? null : req.Body.CreatedDateTime
        }
        // name, price, country, label, imageUrl, createdDateTime
        BottleRepository.Add(bottle.Name, bottle.Price, bottle.Country, bottle.Label, bottle.ImageUrl, bottle.CreatedDateTime)
            .then((obj) => {
                console.log(obj);
                bottle.ID = parseInt(obj[0].ID.toString());

                res.CreatedJSON(bottle);
            })
            .catch((error) => {
                if (error.code === DatabaseErrorCodes.DUPLICATE_ENTRY.DatabaseName) {
                    res.BadRequest(DatabaseErrorCodes.DUPLICATE_ENTRY.ClientName);
                    return;
                }
                res.InternalServerError({error: error.toString()});
            });
    }
);
router.Get('/filter', Validation.ValidateQueryString(Schemas.BottlesGetByFilters), (req, res) => {
    const DATETIME_MIN = '1000-01-01';
    const DATETIME_MAX = '9999-12-31';

    let filter = {
        Name: Utils.DefaultForStringField(req.QueryParams.name),
        PriceMin: Utils.DefaultForNumericField(req.QueryParams.priceMin, 0),
        PriceMax: Utils.DefaultForNumericField(req.QueryParams.priceMax, 1000000),
        Country: Utils.DefaultForStringField(req.QueryParams.country),
        Label: Utils.DefaultForStringField(req.QueryParams.label),
        CreatedDateTimeStart: Utils.DefaultForDateTimeField(req.QueryParams.createdDateTimeStart, DATETIME_MIN),
        CreatedDateTimeEnd: Utils.DefaultForDateTimeField(req.QueryParams.createdDateTimeEnd, DATETIME_MAX),
        OrderColumn: Utils.DefaultForStringField(req.QueryParams.orderColumn),
        OrderDirection: Utils.DefaultForStringField(req.QueryParams.orderDirection),
        RowIndexStart: Utils.DefaultForNumericField(req.QueryParams.indexStart, 1),
        RowIndexEnd: Utils.DefaultForNumericField(req.QueryParams.indexEnd, 8)
    };
    BottleRepository.GetByFilters(filter.Name, filter.PriceMin, filter.PriceMax, filter.Country, filter.Label, filter.CreatedDateTimeStart, filter.CreatedDateTimeEnd)
        .then((result) => {
            if (result.length === 0) {
                res.ContentJSON(result);
                return;
            }
            const columnNamesInDatabase = Object.keys(result[0]);
            const numberColumns = ['ID', 'Price'];
            const orderDirections = ['asc', 'desc'];
            if (filter.OrderColumn !== '') {
                let indexOrderColumn = Utils.IndexOfStringSearchCaseInsensitive(columnNamesInDatabase, filter.OrderColumn);
                if (indexOrderColumn === -1) {
                    res.BadRequest(`Order column ${filter.OrderColumn} not found in columns array!`)
                    return;
                }
                let orderColumn = columnNamesInDatabase[indexOrderColumn];

                let orderDirection = filter.OrderDirection.toLowerCase();
                if (orderDirection === '')
                    orderDirection = 'asc';
                if (!orderDirections.includes(orderDirection)) {
                    res.BadRequest(`Order direction ${orderDirection} must be ${orderDirections[0]} or ${orderDirections[1]}`);
                    return;
                }
                // ascending
                if (orderDirections[0] === orderDirection) {
                    if (numberColumns.includes(orderColumn)) {
                        result.sort(Utils.SortByNumberFieldAscending(orderColumn));
                    }
                    else {
                        result.sort(Utils.SortByStringFieldAscending(orderColumn));
                    }
                }
                // descending
                else {
                    if (numberColumns.includes(orderColumn)) {
                        result.sort(Utils.SortByNumberFieldDescending(orderColumn));
                    }
                    else {
                        result.sort(Utils.SortByStringFieldDescending(orderColumn));
                    }
                }
            }
            if (filter.RowIndexStart > filter.RowIndexEnd) {
                res.BadRequest(`IndexStart greater than IndexEnd. IndexStart=${filter.RowIndexStart} ; IndexEnd=${filter.RowIndexEnd}`);
                return;
            }
            if (filter.RowIndexEnd > result.length) {
                filter.RowIndexEnd = result.length;
            }
            result.slice(filter.RowIndexStart, filter.RowIndexEnd);
            let exportType = req.QueryParams.exportType;
            if (exportType === null || exportType === undefined) {
                res.ContentJSON(result);
                return;
            }

            if (exportType === 'csv') {
                const fileName = `bottles${Date.now().toString()}.csv`;
                res.SendListOfObjectsAsCSV(result, ExportMappingForBottleFilter, fileName);
                return;
            }
            else if (exportType === 'pdf') {
                const fileName = `bottles${Date.now().toString()}.pdf`;
                const titleForPDF = 'Bottles as PDF';
                res.SendListOfObjectsAsPdf(result, ExportMappingForBottleFilter, fileName, titleForPDF);
                return;
            }
            res.BadRequest(`Export type invalid! Export type: ${exportType}`);
        })
        .catch((err) => {
            console.log(err);
            res.InternalServerError(err);
        });
});
module.exports = router;