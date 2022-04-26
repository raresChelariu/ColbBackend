const Utils = require("./Utils");

class Router {
    routePrefix;
    RoutingDictionary = {
        get: {},
        post: {},
        put: {},
        delete: {}
    }

    constructor(routePrefix) {
        if (routePrefix && routePrefix[-1] === '/')
            routePrefix = routePrefix.slice(0, -1);
        this.routePrefix = routePrefix;
    }

    #AssignRouteByHttpMethod(httpMethod, routePath, ...requestHandlers) {
        // if route prefix is given added it before the path given (in controller)
        routePath = Router.GetRoutePath(routePath, this.routePrefix);

        if (!Object.keys(this.RoutingDictionary).includes(httpMethod.toLowerCase())) {
            console.log(`Unsupported http method! Given method : ${httpMethod}`);
            return;
        }
        if (this.RoutingDictionary[httpMethod.toLowerCase()][routePath] !== undefined) {
            console.log(`Handler already defined for route ${httpMethod.toUpperCase()} ${routePath}`);
        }
        this.RoutingDictionary[httpMethod.toLowerCase()][routePath] = requestHandlers;
    }

    Get(routePath, ...requestHandlers) {
        this.#AssignRouteByHttpMethod('GET', routePath, requestHandlers);
    }

    Post(routePath, ...requestHandlers) {
        this.#AssignRouteByHttpMethod('POST', routePath, requestHandlers);
    }

    Put(routePath, ...requestHandlers) {
        this.#AssignRouteByHttpMethod('PUT', routePath, requestHandlers);
    }

    Delete(routePath, ...requestHandlers) {
        this.#AssignRouteByHttpMethod('DELETE', routePath, requestHandlers);
    }

    ExecuteRouteHandler(req, res) {
        if (!this.IsHttpMethodSupported(req)) {
            res.BadRequest(`Http Method not supported! Http Method provided: ${req.HttpMethod}.`);
            return;
        }
        let routeActions = this.#GetRouteHandlerByRequest(req);
        if (routeActions === undefined || routeActions === null) {
            console.log(`No action assigned for route ${req.HttpMethod} ${req.Path}`)
            res.BadRequest('No route assigned');
            return;
        }
        for (let i = 0; i < routeActions.length; i++) {
            let currentAction = routeActions[i];
            let goToNextAction = currentAction(req, res) === true;
            if (!goToNextAction)
                break;
        }
    }

    #GetRouteHandlerByRequest(req) {
        const method = req.HttpMethod.toLowerCase();
        const path = req.Path;
        if (!(this.RoutingDictionary[method][path]))
            return undefined;
        return this.RoutingDictionary[method][path][0];
    }

    IsHttpMethodSupported(req) {
        return Object.keys(this.RoutingDictionary).includes(req.HttpMethod.toLowerCase())
    }

    AllRoutesToString() {
        let finalString = '';
        let methods = Object.keys(this.RoutingDictionary);
        for (let i = 0; i < methods.length; i++) {
            let paths = Object.keys(this.RoutingDictionary[methods[i]]);
            for (let j = 0; j < paths.length; j++) {
                finalString += `${methods[i]} ${paths[j]}\n`;
            }
        }
        return finalString;
    }

    static GetRoutePath(routePath, routePrefix) {
        routePath = routePrefix
            ? Utils.RemoveTrailingSlash(routePrefix) + Utils.RemoveTrailingSlash(routePath)
            : Utils.RemoveTrailingSlash(routePath);
        routePath = Utils.RemoveTrailingSlash(routePath);
        return routePath;
    }

}


module.exports = Router;