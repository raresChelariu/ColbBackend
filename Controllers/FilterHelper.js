const Utils = require("../DataAccess/MariaDB/Utils");
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
class FilterHelper {
    static FilterHelperForBottles(req, res, result, filter) {
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
        result = result.slice(filter.RowIndexStart - 1, filter.RowIndexEnd);
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
            res.SendListOfObjectsAsPDF(result, ExportMappingForBottleFilter, fileName, titleForPDF);
            return;
        }
        res.BadRequest(`Export type invalid! Export type: ${exportType}`);
    }
    static GetFilterForBottles(req) {
        const DATETIME_MIN = '1000-01-01';
        const DATETIME_MAX = '9999-12-31';

        return {
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
    }
}

module.exports = FilterHelper;