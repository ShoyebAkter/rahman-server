const bcrypt = require('bcryptjs')
const { LoginDetail, User, UserRole } = require('../models')
const { sign } = require('jsonwebtoken');
const axios = require('axios')

// Function to authenticate a user
const login = async (req, res) => {
    try {
        // Extract user data from the request body
        const formData = req.body;

        // Find the user by primary key (assuming Sequelize model)
        const user = await LoginDetail.findOne({
            where: {
                email: formData.email
            },
            include: [User, UserRole]


            
        });


        if (user) {
            // Check if the LoginDetail has a status property
            if (user.status) {
            
                // Compare the provided password with the hashed password
                bcrypt.compare(formData.password, user.password, (err, result) => {
                    if (err) {
                        // Respond with an error if there is an issue with bcrypt
                        return res.status(500).json({ error: err.message });
                    }
                    console.log(result,formData.password,user.password)
                    if (result) {
                        // If passwords match, create a JWT token and respond with it
                        const data = {
                            loginInfo: user,
                            login_status: true,
                        };

                        const secretKey = "loginToken"

                        const options = {
                            expiresIn: '2h'
                        }

                        const loginToken = sign(data, secretKey, options)
                        
                       return  res.json(loginToken);
                    } else {
                        // Respond with an error if passwords don't match
                        res.status(500).json({ error: "Passwords don't match" });
                    }
                });
            
            } else {
                // If the LoginDetail status is false, the account is blocked
                res.status(500).json({ error: "Your account is blocked - Contact the admin (265884799203)" });
            }
        } else {
            // Respond with an error if the user is not found
            res.status(500).json({ error: "User not found" });
        }
    } catch (error) {
        // Handle any unexpected errors and respond with an appropriate status and message
       if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
};

const getAuthenticatedUser = (req, res) => {
    const authenticatedUser = req.authenticatedUser
    res.json(authenticatedUser)
}

//compares plain password from user form with hashed password from the db using bcryptjs
const comparePasswords = (password, hashedPassword) => {
    try {
        return bcrypt.compareSync(password, hashedPassword)
    } catch (error) {
        console.log({error})
    }
}

module.exports = {
    login,
    getAuthenticatedUser,
}