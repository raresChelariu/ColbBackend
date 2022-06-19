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

    static AddBottleToCollection(accountID, collectionID, bottleID) {
        return BaseRepository.Query({
            sql: 'call CollectionsAddBottle(?, ?, ?)',
            values: [accountID, collectionID, bottleID]
        });
    }

    static CollectionBottlesGetByFilters(AccountID, CollectionID, Name, PriceMin, PriceMax, Country, Label, CreatedDateTimeStart, CreatedDateTimeEnd) {
        return BaseRepository.Query({
            sql: 'call CollectionBottlesGetByFilters(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            values: [AccountID, CollectionID, Name, PriceMin, PriceMax, Country, Label, CreatedDateTimeStart, CreatedDateTimeEnd]
        });
    }
}

module.exports = CollectionRepository;