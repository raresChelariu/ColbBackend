const Router = require('./../Routing/Router')
const JwtMiddleware = require("../Middleware/JwtMiddleware");

const router = new Router();

router.Get('/', (req, res) => {
    res.ContentPlain('We got to bottles');
});

router.Get('/authroute', JwtMiddleware.AuthorizedRequest, (req, res) => {
    res.SetHeader()
    res.ContentPlain('Auth ok :)')
});

router.Get('/testing', (req, res) => {
    res.ContentJSON({message: 'it works guys', date: new Date()});
})
module.exports = router;