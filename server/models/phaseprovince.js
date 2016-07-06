module.exports = function(bookshelf) {
    var _ = require('lodash'),
        province,
        provinces;

    province = bookshelf.Model.extend({
        tableName: 'phase_provinces',
        hasTimestamps: true,

        phase: function() {
            return this.belongsTo('Phase');
        },

        getFullName: function(base, sub) {
            if (sub)
                return base + '/' + sub;
            else
                return base;
        },

        toJSON: function(options) {
            var obfuscate = options.obfuscate,
                unit = this.get('unitOwner') ? {
                    type: this.get('unitType'),
                    owner: this.get('unitOwner'),
                    fill: this.get('unitFill'),
                    action: obfuscate ? null : this.get('unitAction'),
                    source: obfuscate ? null : this.getFullName(this.get('unitSource'), this.get('unitSubsource')),
                    target: obfuscate ? null : this.getFullName(this.get('unitTarget'), this.get('unitSubtarget')),
                    failed: this.get('isFailed'),
                    targetOfTarget: obfuscate ? null : this.getFullName(this.get('unitTargetOfTarget'), this.get('unitSubtargetOfTarget')),
                    actionOfTarget: obfuscate ? null : this.get('unitActionOfTarget')
                } : null,
                sc = !_.isUndefined(this.get('supplyCentre')) ? {
                    owner: this.get('supplyCentre'),
                    fill: this.get('supplyCentreFill'),
                    location: this.get('supplyCentreLocation')
                } : null;

            return {
                p: this.getFullName(this.get('provinceKey'), this.get('subProvinceKey')),
                sc: sc,
                unitLocation: this.get('unitLocation'),
                unit: unit
            };
        }
    });

    provinces = bookshelf.Collection.extend({
        model: province
    });

    return {
        PhaseProvince: bookshelf.model('PhaseProvince', province),
        PhaseProvinces: bookshelf.collection('PhaseProvinces', provinces)
    };
};
