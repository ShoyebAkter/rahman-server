module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        dateOfPayment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, ]
            }
        },
        referenceNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        otherDetails: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: 'payments'
    })

    Payment.associate = models => {
        Payment.belongsTo(models.PaymentInit, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey : {
                name: "paymentId",
                allowNull: false
            }
        })
    }

    return Payment;
}