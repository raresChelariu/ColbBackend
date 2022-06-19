const Router = require('./../Routing/Router');
const Validation = require("../Middleware/Validation");
const BottleRepository = require("../DataAccess/MariaDB/BottleRepository");
const DatabaseErrorCodes = require("../DataAccess/MariaDB/DatabaseErrorCodes");
const FilterHelper = require("./FilterHelper");
const RSSHelper = require("./RSSHelper");

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
            'indexStart': {'type': 'string', 'pattern': /[1-9]+\d*/},
            'indexEnd': {'type': 'string', 'pattern': /[1-9]+\d*/},
            'exportType': {'type': 'string'}
        }
    }
};




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
    const filter = FilterHelper.GetFilterForBottles(req);
    BottleRepository.GetByFilters(filter.Name, filter.PriceMin, filter.PriceMax, filter.Country, filter.Label, filter.CreatedDateTimeStart, filter.CreatedDateTimeEnd)
        .then((result) => {
            FilterHelper.FilterHelperForBottles(req, res, result, filter);
        })
        .catch((err) => {
            res.InternalServerError(err);
        });
});

router.Get('/last5', (req, res) => {
    const bottleNumber = 5;
    BottleRepository.GetLastAdded(bottleNumber)
        .then(result => {
            try {
                let xmlResult = RSSHelper.GenerateRSSFromBottles(result);
                res.ContentXML(xmlResult);
            } catch (err) {
                res.InternalServerError(err);
            }
        }).catch((err) => {
        res.InternalServerError(err);
    });
});
module.exports = router;