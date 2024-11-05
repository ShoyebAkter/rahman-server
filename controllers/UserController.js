const { User, LoginDetail, sequelize, UserRole } = require('../models')
const bcrypt = require('bcryptjs')

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: [{model: LoginDetail, include: [UserRole]}]})
        res.json(users)
    } catch (error) {
        // Catch and handle any unexpected errors
        if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
}

const getUser = (req, res) => {
    
}

const addUser = async (req, res) => {
    // Extracting relevant data from the request body
    const { email, firstName, lastName, mobile, password, roleId } = req.body;
    try {
        // If user does not exist, create a new user
        const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
        });

        // Hash the provided password
        const hashedPassword = generateHashedPassword(password);
    
        // Use a transaction to ensure data consistency across multiple operations
        const transaction = await sequelize.transaction();

        try {
            // Create login details for the new user
            const loginDetail = await LoginDetail.create({
                userId: newUser.id,
                email: email,
                roleId: roleId,
                password: hashedPassword,
            }, { transaction });

            // Commit the transaction if all operations are successful
            await transaction.commit();

            // Respond with the created user and login details
            res.json({ userData: newUser, loginData: loginDetail });
        } catch (error) {
            // Rollback the transaction if any operation fails
            await transaction.rollback();

            // Delete the user if login detail creation fails
            await User.destroy({ where: { id: newUser.id } });

            // Handle errors and respond with appropriate status and message
            if (error.errors) {
                const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
                res.status(500).json({ error: error_message.join(', ') });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    
    } catch (error) {
        // Catch and handle any unexpected errors
       if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
};

const editUser = async (req, res) => {
    try {
        const { id, firstName, lastName, mobile, email, roleId, status } = req.body

        const updatedUser = await User.update({
            firstName, lastName, mobile
        }, {
            where: {
                id
            }
        })

        if(updatedUser[0]){
            const updatedDetails = await LoginDetail.update({
                email, roleId, status
            }, {
                where: {
                    userId: id
                }
            })

            if(updatedDetails[0]){
                return res.json({message: 'success'})
            }
        }

        return res.status(500).json({error: "Failed to update"})

    } catch (error) {
        // Catch and handle any unexpected errors
       if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        } 
    }
}

const editPassword = async (req, res) => {
    try {
        const { id, password } = req.body

        const updatedUser = await LoginDetail.update({
            password: generateHashedPassword(password)
        }, {
            where: {
                userId: id
            }
        })

       return res.json({message: updatedUser[0]})

    } catch (error) {
        // Catch and handle any unexpected errors
       if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        } 
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id

        const deleted = await User.destroy({
            where: {id}
        })

        res.json({status: deleted})

    } catch (error) {
         // Catch and handle any unexpected errors
       if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
}

//function to generate hashed password using bcryptjs
const generateHashedPassword = password => {
    try {
        const saltRounds = 10
        const hashedPassword = bcrypt.hashSync(password, saltRounds)
        return hashedPassword
    } catch (error) {
       console.log({error})
    }
}

module.exports = {
    getUsers,
    getUser,
    addUser,
    editUser,
    deleteUser, 
    editPassword,
}