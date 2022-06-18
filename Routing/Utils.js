const url = require('url');
const PDFDocument = require('pdfkit');
const {Parser} = require("json2csv");
class Utils {
    static GetRelativePathFromRequest(req) {
        return url.parse(req.url, true).pathname;
    }
    static IsStringValidJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    static RemoveTrailingChar(s, charToTrim) {
        const regExp = new RegExp(charToTrim + "+$");
        return s.replace(regExp, "");
    }
    static RemoveTrailingSlash(s) {
        let last = s.length - 1;
        let countTrailingChar = 0;
        for (let i = last; i >= 0 && s[i] === '/'; i--)
            countTrailingChar++;
        if (countTrailingChar === 0)
            return s;
        return s.slice(0, -countTrailingChar);
    }
    static StringArraysAreEqual(a, b) {
        if (a === undefined || a === null || b === undefined || b === null) {
            return false;
        }
        if (a.length !== b.length) {
            return false;
        }
        a.sort();
        b.sort();
        for (let i = 0; i < a.length; i++)
            if (a[i] !== b[i])
                return 0;
        return 1;
    }
    static CreatePDFInStream(title, content, dataCallback, endCallback) {
        const doc = new PDFDocument();
        doc.on('data', dataCallback);
        doc.on('end', endCallback);
        // doc.image('clobLogo.jpg', {
        //     fit: [250, 300],
        //     align: 'center',
        //     valign: 'center'
        // });
        doc.fontSize(20).text(title);
        doc.text('\n');
        doc.fontSize(10).text(content);
        doc.end();
    }
    static CreateCSVAsString(objectList, mapperPropertyToCSVFieldName) {
        let fields = [];
        let labels = Object.keys(mapperPropertyToCSVFieldName);
        for (let i = 0; i < labels.length; i++) {
            fields.push({
                label: mapperPropertyToCSVFieldName[labels[i]],
                value: labels[i]
            });
        }
        const jsonToCsvParser = new Parser( { fields } );
        return jsonToCsvParser.parse(objectList);
    }
}

module.exports = Utils;