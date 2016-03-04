var glob = require('glob'),
    fs = require('fs'),
    path = require('path');

module.exports = function() {
    'use strict';

    var app = this.app;

    app.io.route('variant', {
        list: function(req, res) {
            glob('variants/**/*.json', function(err, files) {
                var v,
                    nameList = [];
                if (err)
                    console.error(err);
                for (v = 0; v < files.length; v++)
                    nameList.push(JSON.parse(fs.readFileSync(path.join(__dirname, '../..', files[v]))).name);

                return res.json(nameList);
            });
        }
    });
};
