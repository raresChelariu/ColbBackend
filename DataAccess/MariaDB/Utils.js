const {sha256} = require('js-sha256')

class Utils {
    static HashString(s) {
        return sha256(s);
    }

    static SortByStringFieldAscending(fieldName) {
        return (a, b) => {
            const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
            const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
            if (nameA === nameB)
                return 0;
            if (nameA < nameB) {
                return -1;
            }
            return 1;
        }
    }
    static SortByStringFieldDescending(fieldName) {
        return (a, b) => {
            const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
            const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
            if (nameA === nameB)
                return 0;
            if (nameA > nameB) {
                return -1;
            }
            return 1;
        }
    }

    static SortByNumberFieldAscending(fieldName) {
        return (a, b) => {
            return a[fieldName] - b[fieldName];
        }
    }

    static SortByNumberFieldDescending(fieldName) {
        return (a, b) => {
            return b[fieldName] - a[fieldName];
        }
    }

    static DefaultForDateTimeField(field, defaultValue) {
        if (field === null || field === undefined)
            return defaultValue;
        return field;
    }

    static DefaultForStringField(field) {
        if (field === null || field === undefined)
            return '';
        return field;
    }

    static DefaultForNumericField(field, defaultValue) {
        if (field === null || field === undefined) {
            return defaultValue;
        }
        return field;
    }
    static IndexOfStringSearchCaseInsensitive(arr, str) {
        str = str.toUpperCase();
        let arrNew = JSON.parse(JSON.stringify(arr));
        for (let i = 0; i < arrNew.length; i++)
            arrNew[i] = arrNew[i].toUpperCase();
        return arrNew.indexOf(str);
    }
}

module.exports = Utils;