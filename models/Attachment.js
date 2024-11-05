module.exports = (sequelize, DataTypes) => {
    const Attachment = sequelize.define("Attachment", {
        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contentLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        localLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        
    },{
        tableName: "attachments",
    })

    Attachment.associate = models => {
        Attachment.belongsTo(models.Employee, {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            foreignKey: {
                name: "employeeId",
                allowNull: false,
            }
        })
    }

    return Attachment
}