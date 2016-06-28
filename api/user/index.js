
'use strict';

var user = require('./controller');

module.exports = express => {
    let router = express.Router();

    // CRUD
    router.post   ('/',     user.create);
    router.get    ('/:id?', user.retrieve);
    router.put    ('/:id',  user.update);
    router.delete ('/:id',  user.delete);

    // OTHER
    router.post('/signin',   user.authenticate);

    return router;
};