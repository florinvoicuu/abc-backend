'use strict';

var commenter   = require('./controller');

module.exports = express => {
    let router = express.Router();

    // CRUD
    router.post   ('/',             commenter.create);
    router.get    ('/:id',          commenter.retrieve);
    router.put    ('/:id',          commenter.update);
    router.delete ('/:id',          commenter.delete);


    return router;
};