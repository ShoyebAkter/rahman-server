module.exports = (sequelize, DataTypes) => {
    const Visa = sequelize.define("Visa", {
        viId: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
        },
        referenceNo: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        issueDate: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        expiryDate: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                isIn: [["Submitted", "In Progress", "Completed", "Active", "Expired"]]
            }
        },
    },{
        tableName: "visas",
    })

    Visa.associate = models => {
        Visa.belongsTo(models.Employee, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        })
    }

    return Visa
}