const BaseRepository = require("./BaseRepository");

class CollectionRepository {
    static Add(name, description, accountID) {
        return BaseRepository.Query({
            sql: 'call CollectionAdd(?, ?, ?)',
            values: [name, description, accountID]
        });
    }
    static GetByFiltersForAccountID(accountID, namePattern, descriptionPattern, inputDateTimeStart, inputDateTimeEnd) {
        return BaseRepository.Query({
            sql: 'call CollectionsGetByFilters(?, ?, ?, ?, ?)',
            values: [accountID, namePattern, descriptionPattern, inputDateTimeStart, inputDateTimeEnd]
        });
    }
}

module.exports = CollectionRepository;