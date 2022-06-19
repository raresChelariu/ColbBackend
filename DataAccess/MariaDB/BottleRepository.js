const BaseRepository = require("./BaseRepository");

class BottleRepository {
    static Add(name, price, country, label, imageUrl, createdDateTime) {
        return BaseRepository.Query({
            sql: 'call BottleAdd(?, ?, ?, ?, ?, ?)',
            values: [name, price, country, label, imageUrl, createdDateTime]
        });
    }
    static GetByFilters(Name, PriceMin, PriceMax, Country, Label, CreatedDateTimeStart, CreatedDateTimeEnd) {
        return BaseRepository.Query({
            sql: 'call BottlesGetByFilters(?, ?, ?, ?, ?, ?, ?)',
            values: [Name, PriceMin, PriceMax, Country, Label, CreatedDateTimeStart, CreatedDateTimeEnd]
        });
    }
    static GetLastAdded(bottleNumber) {
        return BaseRepository.Query({
            sql: 'call BottleGetLastAdded(?)',
            values: [bottleNumber]
        });
    }
}

module.exports = BottleRepository;