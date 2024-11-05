const express = require('express')
const router = express.Router()
const { addRole, getRoles, editRole, deleteRole } = require('../controllers/UserRoleController')
const AuthMiddleware = require('../middleware/AuthMiddleware')

router.post('/addRole', addRole)
router.get('/', getRoles)
router.put('/editRole', editRole)
router.delete('/deleteRole/:id', deleteRole)

module.exports = router