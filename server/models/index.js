module.exports.init = function(bookshelf) {
    var _ = require('lodash'),
        models = ['user', 'game', 'phase'],
        out = { },
        m;

    for (m = 0; m < models.length; m++)
        _.extend(out, require('./' + models[m])(bookshelf));

    return out;
};
