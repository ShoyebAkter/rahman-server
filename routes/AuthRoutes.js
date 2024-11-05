const express = require('express')
const router = express.Router()
const { login, getAuthenticatedUser } = require('../controllers/AuthController')
const authMiddleware = require('../middleware/AuthMiddleware')

router.post("/login" , login)
router.get('/authenticatedUser', authMiddleware, getAuthenticatedUser)

module.exports = router
