require('dotenv').config();
const AccountsController = require('./Controllers/AccountController');
const BottlesController = require('./Controllers/BottlesController');
const Server = require('./Routing/ServerRouter');

let server = new Server(3000, () => {
    console.log('Server is now listening for requests')
});

server.Use('/accounts', AccountsController);
server.Use('/bottles', BottlesController);


server.listen();