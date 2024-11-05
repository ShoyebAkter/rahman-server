const { Agent, Employee, Passport } = require('../models')

const getAgents = async (req, res) => {
    try {
        const agents = await Agent.findAll({
            include: [
                {
                    model: Employee,
                    include: [
                       Passport
                    ]
                },
            ]
            , order: [
            ['id', 'DESC'],
        ]})

        if(agents.length !== 0){
            res.json(agents)
        }else{
            res.json({error: "Agents not found"})
        }
    } catch (error) {
        res.status(500).json({error})
    }
}

const getAgent = async (req, res) => {

}

const addAgent = async (req, res) => {

    try {  
        const roleName = req.authenticatedUser.loginInfo.UserRole.roleName
        const data = req.body
        console.log(data)
        if(roleName === "admin"){
            await Agent.create(data).then(result => {
                res.json(result)
            })
        }else{
            res.status(500).json({error: "Access denied"})
        }
    } catch (error) {
        if(error.errors){
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message)
            res.status(500).json({error: error_message.join(',')})
        }else{
            res.status(500).json({error: error.message})
        }
    }
   
}

const editAgent = async (req, res) => {
   
    try {  
        const { id, name, mobile, email } = req.body

        await Agent.update(
            {
                name, mobile, email
            },
            {
                where: {
                    id
                },
            }).then((result) => {
                res.json({response: result[0]});
            })
            .catch((error) => {
                res.status(500).json({error: `Error updating record ${error}`});
            }
        );
    } catch (error) {
        if(error.errors){
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message)
            res.status(500).json({error: error_message.join(',')})
        }else{
            res.status(500).json({error: error.message})
        }
    }
}

const deleteAgent = async (req, res) => {
    try {
        const id = req.params.id
 
        await Agent.destroy({
            where: {
                id
            },
        }).then(() => {
            res.json({message: 'Record deleted successfully'});
        })
        .catch((error) => {
            res.status(500).json({error: `Error deleting record ${error}`});
        });
       
        
    } catch (error) {
        if(error.errors){
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message)
            res.status(500).json({error: error_message.join(',')})
        }else{
            res.status(500).json({error: error.message})
        }
    }
}


module.exports = {
    getAgents,
    getAgent,
    addAgent,
    editAgent,
    deleteAgent
}

