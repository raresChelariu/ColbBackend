require('dotenv').config();
const AccountsController = require('./Controllers/AccountController');
const BottlesController = require('./Controllers/BottlesController');
const CollectionsController = require('./Controllers/CollectionsController')
const Server = require('./Routing/ServerRouter');

const PORT = 3000;
let server = new Server(3000, () => {
    console.log(`Server is now listening for requests on port ${PORT}`);
});

server.Use('/accounts', AccountsController);
server.Use('/bottles', BottlesController);
server.Use('/collections', CollectionsController);

server.listen();