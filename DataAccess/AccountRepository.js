const Utils = require("./Utils");
const BaseRepository = require("./BaseRepository");

class AccountRepository {
    static Register(email, firstName, lastName, password) {
        password = Utils.HashString(password);
        return BaseRepository.Query({
            sql: 'call AccountRegister(?, ?, ?, ?)',
            values: [email, firstName, lastName, password]
        });
    }
    static Login(email, password) {
        password = Utils.HashString(password);
        return BaseRepository.Query({
            sql: 'call AccountLogin(?, ?)',
            values: [email, password]
        });
    }
}

module.exports = AccountRepository;