module.exports = (sequelize, DataTypes) => {
    const EmergencyContact = sequelize.define("EmergencyContact", {
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: false,
            validate: {
                len: [5, 15],
                isNumeric: true
            }
        },
        telephone: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    },{
        tableName: "emergencyContacts",
    })

    EmergencyContact.associate = models => {
        EmergencyContact.belongsTo(models.Employee, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        })
    }

    return EmergencyContact
}