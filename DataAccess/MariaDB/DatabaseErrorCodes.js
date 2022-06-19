module.exports = {
    DUPLICATE_ENTRY:
        {
            DatabaseName: 'ER_DUP_ENTRY',
            ClientName: 'Duplicate entry'
        },
    BUSINESS_ERROR: {
        DatabaseName: 'ER_SIGNAL_EXCEPTION',
        ClientName: '' // depends on what the database procedure returns
    }
};