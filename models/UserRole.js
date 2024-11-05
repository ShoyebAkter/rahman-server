module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define("UserRole", {
        roleName: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true,
            validate: {
                isAlphaWithSpacesAndQuotes(value) {
                    if (!/^[a-zA-Z\s']+$/g.test(value)) {
                    throw new Error('Only alphabetical characters, spaces, and quotes are allowed.');
                    }
                },
            }
        }
    },{
        tableName: "user_roles"
    })

    UserRole.associate = models => {
        UserRole.hasMany(models.LoginDetail, {
            foreignKey: {
                name: "roleId",
                allowNull: false,
            }
        })
    }

    return UserRole
}