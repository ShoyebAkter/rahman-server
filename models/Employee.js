module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define("Employee", {
        idNo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            },
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        DOB: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        nationality: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },        
        telephone: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [["Active", "Inactive"]]
            }
        },
    },{
        tableName: "employees"
    })

    Employee.associate = models => {
        Employee.belongsTo(models.User, {
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "userId",
                allowNull: true,
            }
        }),
        Employee.hasMany(models.EmergencyContact, {
            foreignKey: {
                name: "employeeId",
                allowNull: true,
            }
        }),
        Employee.hasOne(models.Health, {
            foreignKey: {
                name: "employeeId",
                allowNull: false,
                unique: true,
            }
        }),
        Employee.belongsTo(models.Agent, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "agentId",
                allowNull: false,
            }
        })
        Employee.hasMany(models.Attachment, {
            foreignKey: {
                name: "employeeId",
                allowNull: true,
            }
        }),
        Employee.hasMany(models.Passport, {
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        }),
        Employee.hasMany(models.Visa, {
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        }),
        Employee.hasMany(models.PaymentInit, {
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        })
    }


    return Employee
}