const Router = require('./../Routing/Router')

const router = new Router();

router.Get('/', (req, res) => {
    res.ContentPlain('We got to bottles');
});

module.exports = router;