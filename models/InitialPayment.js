module.exports = (sequelize, DataTypes) => {
    const PaymentInit = sequelize.define("PaymentInit", {
        year: {
            type: DataTypes.STRING(6),
            allowNull: false,
            validate: {
                len: [1, 6],
                isNumeric: true
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },{
        tableName: "initial_payments",
    })

    PaymentInit.associate = models => {
        PaymentInit.belongsTo(models.Employee, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        }),
        PaymentInit.hasMany(models.Payment, {
            foreignKey: {
                name: "paymentId",
                allowNull: true,
            }
        })
    }

    return PaymentInit
}