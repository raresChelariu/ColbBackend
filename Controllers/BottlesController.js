const Router = require('./../Routing/Router')
const JwtMiddleware = require("../Middleware/JwtMiddleware");

const router = new Router();

router.Get('/', (req, res) => {
    res.ContentPlain('We got to bottles');
});

router.Get('/authroute', JwtMiddleware.AuthorizedRequest, (req, res) => {
    res.ContentPlain('Auth ok :)')
});
module.exports = router;