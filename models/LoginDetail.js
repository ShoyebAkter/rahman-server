module.exports = (sequelize, DataTypes) => {
    const LoginDetail = sequelize.define("LoginDetail", {
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    },{
        tableName: "login_details"
    })

    LoginDetail.associate = models => {
        LoginDetail.belongsTo(models.User, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "userId",
                allowNull: false,
            }
        }),
        LoginDetail.belongsTo(models.UserRole, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "roleId",
                allowNull: false,
            }
        })
    }

    return LoginDetail
}