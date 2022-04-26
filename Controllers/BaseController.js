const Router = require("./../Routing/Router");

class BaseController {
    router

    constructor(routePrefix) {
        this.router = new Router(routePrefix);
    }

    GetRouter() {
        return this.router;
    }
}


module.exports = BaseController;