const { UserRole } = require('../models')

const addRole = async (req, res) => {
    try {
        const dataFromClient = req.body
        await UserRole.create(dataFromClient)
        .then(result => {
            res.json(result)
        })
    } catch (error) {
        res.status(500).json({error})
    }

}

const getRoles = async (req, res) => {
    try {
        await UserRole.findAll()
        .then(result => {
            res.json(result)
        })
    } catch (error) {
        res.status(500).json({error})
    }

}

const editRole = async (req, res) => {
    try {
        const {roleName, id} = req.body
        await UserRole.update({roleName}, {where: 
            {id}
        })
        .then(result => {
            res.json(result)
        })
    } catch (error) {
        res.status(500).json({error})
    }

}

const deleteRole = async (req, res) => {
    try {
        const id = req.params.id
        await UserRole.destroy({where: {id}})
        .then(result => {
            res.json(result)
        })
    } catch (error) {
        res.status(500).json({error})
    }

}

module.exports = {
    addRole,
    editRole,
    getRoles,
    deleteRole,
}