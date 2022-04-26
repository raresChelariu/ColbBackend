const url = require('url');

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

}

module.exports = Utils;