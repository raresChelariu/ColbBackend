const http = require('http');
const RequestEntity = require('./RequestEntity');
const ResponseEntity = require('./ResponseEntity');
const Router = require("./Router");

class ServerRouter {
    #router
    port
    #callbackOnListen

    constructor(port, callbackOnListen) {
        this.port = port;
        this.#callbackOnListen = callbackOnListen;
        this.#router = new Router();
    }

    listen() {
        if (this.#router === null || this.#router === undefined) {
            console.log('No routes defined !')
        }
        console.log(this.#router.AllRoutesToString());
        http.createServer(async (req, res) => {
            // browser sends an HTTP OPTIONS request, before actually sending the request
            if (req.method === "OPTIONS") {
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                return res.end();
            }
            let reqEntity = new RequestEntity(req);
            await reqEntity.Init();
            let resEntity = new ResponseEntity(res);
            this.#router.ExecuteRouteHandler(reqEntity, resEntity);
        }).listen(this.port, this.#callbackOnListen);
    }

    Use(routePrefix, otherRouter) {
        for (const httpMethod in otherRouter.RoutingDictionary) {
            const routesForHttpMethod = otherRouter.RoutingDictionary[httpMethod];
            for (const path in routesForHttpMethod) {
                if (!otherRouter.RoutingDictionary[httpMethod][path]) {
                    // no route defined here, in #router, so continue
                    continue;
                }
                let finalPath = Router.GetRoutePath(path, routePrefix);

                if (this.#router.RoutingDictionary[httpMethod][finalPath]) {
                    // Route defined both in #router and otherRouter
                    console.log(`Route will be overwritten! Route: ${httpMethod}${finalPath}`)
                }
                // assign route from other to #router
                this.#router.RoutingDictionary[httpMethod][finalPath] = otherRouter.RoutingDictionary[httpMethod][path];
            }
        }
    }
}

module.exports = ServerRouter