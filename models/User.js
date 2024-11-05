module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        firstName: {
            type: DataTypes.STRING(40),
            allowNull: false,
            validate: {
                len: [3, ],
                isAlphaWithSpacesAndQuotes(value) {
                    if (!/^[a-zA-Z\s']+$/g.test(value)) {
                    throw new Error('Only alphabetical characters, spaces, and quotes are allowed.');
                    }
                },
            }
        },
        lastName: {
            type: DataTypes.STRING(40),
            allowNull: false,
            validate: {
                len: [3, ],
                isAlphaWithSpacesAndQuotes(value) {
                    if (!/^[a-zA-Z\s']+$/g.test(value)) {
                    throw new Error('Only alphabetical characters, spaces, and quotes are allowed.');
                    }
                },
            }
        },
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: false,
            validate: {
                len: [5, 15],
                isNumeric: true
            }
        }
    }, {
        tableName: "users"
    })

    User.associate = models => {
        User.hasOne(models.LoginDetail , {
            foreignKey: {
                name: "userId",
                allowNull: false,
                unique: true,
            }
        }),
        User.hasMany(models.Employee, {
            foreignKey: {
                name: "userId",
                allowNull: true, 
            }
        })    
    }

    return User
}