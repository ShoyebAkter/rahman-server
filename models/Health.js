module.exports = (sequelize, DataTypes) => {
    const Health = sequelize.define("Health", {
        bloodGroup: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "health_details"
    })

    Health.associate = models => {
        Health.belongsTo(models.Employee, {
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: true,
            }
        })
    }

    return Health
}