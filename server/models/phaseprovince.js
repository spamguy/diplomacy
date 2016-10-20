module.exports = function(bookshelf) {
    var province,
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
            var obfuscate = options.obfuscate && options.currentPlayerPower !== this.get('unitOwner'),
                unit = this.get('unitOwner') ? {
                    type: this.get('unitType'),
                    owner: this.get('unitOwner'),
                    fill: this.get('unitFill'),
                    action: obfuscate ? null : this.get('unitAction'),
                    target: obfuscate ? null : this.getFullName(this.get('unitTarget'), this.get('unitSubtarget')),
                    resolution: this.get('resolution'),
                    targetOfTarget: obfuscate ? null : this.getFullName(this.get('unitTargetOfTarget'), this.get('unitSubtargetOfTarget')),
                    actionOfTarget: obfuscate ? null : this.get('unitActionOfTarget')
                } : null,
                sc = this.get('supplyCentreLocation') ? {
                    owner: this.get('supplyCentre'),
                    fill: this.get('supplyCentreFill'),
                    location: this.get('supplyCentreLocation')
                } : null,
                dislodged = this.get('dislodgedOwner') ? {
                    owner: this.get('dislodgedOwner'),
                    fill: this.get('dislodgedFill'),
                    action: this.get('dislodgedAction'),
                    type: this.get('dislodgedType')
                } : null;

            return {
                p: this.getFullName(this.get('provinceKey'), this.get('subprovinceKey')),
                sc: sc,
                unitLocation: this.get('unitLocation'),
                unit: unit,
                dislodged: dislodged,
                adjustedUnitType: this.get('adjustedUnitType')
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
