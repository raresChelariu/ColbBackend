const {sha256} = require('js-sha256')

class Utils {
    static HashString(s) {
        return sha256(s);
    }
}

module.exports = Utils;