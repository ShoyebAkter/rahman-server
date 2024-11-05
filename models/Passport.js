module.exports = (sequelize, DataTypes) => {
    const Passport = sequelize.define("Passport", {
        passportNo: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
        },
        issueDate: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        expiryDate: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
    },{
        tableName: "passports",
    })

    Passport.associate = models => {
        Passport.belongsTo(models.Employee, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        })
    }

    return Passport
}