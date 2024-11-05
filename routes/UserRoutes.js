const express = require('express')
const router = express.Router()
const { getUsers, getUser, addUser, editUser, deleteUser, editPassword } = require('../controllers/UserController')
const AuthMiddleware = require('../middleware/AuthMiddleware')

router.get('/', getUsers)
router.get('/user/:id', AuthMiddleware, getUser)
router.post('/addUser', addUser)
router.put('/editUser', AuthMiddleware, editUser)
router.put('/editPassword', AuthMiddleware, editPassword)
router.delete('/deleteUser/:id', AuthMiddleware, deleteUser)

module.exports = router
