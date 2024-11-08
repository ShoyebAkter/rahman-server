module.exports = (sequelize, DataTypes) => {
    const Agent = sequelize.define("Agent", {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isAlphanumericWithSpacesAndQuotes(value) {
                    if (!/^[a-zA-Z0-9\s']+$/g.test(value)) {
                        throw new Error('Only alphanumeric characters, spaces, and quotes are allowed.');
                    }
                },
            }
        },
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            
        },
    },{
        tableName: "agents",
    })

    Agent.associate = models => {
        Agent.hasMany(models.Employee, {
            foreignKey: {
                name: "agentId",
                allowNull: false,
            }
        })
    }

    return Agent
}
