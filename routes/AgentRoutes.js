const express = require('express')
const router = express.Router()
const AuthMiddleware = require('../middleware/AuthMiddleware')
const { 
    getAgents, 
    getAgent, 
    addAgent, 
    editAgent, 
    deleteAgent,
} = require('../controllers/AgentController')

router.get('/', AuthMiddleware, getAgents)
router.get('/Agent/:id', AuthMiddleware, getAgent)
router.post('/addAgent', AuthMiddleware, addAgent)
router.put('/editAgent', AuthMiddleware, editAgent)
router.delete("/deleteAgent/:id", AuthMiddleware, deleteAgent)

module.exports = router