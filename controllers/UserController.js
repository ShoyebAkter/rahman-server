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
    const { email, firstName, lastName, mobile, password, roleId } = req.body;
    
    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        // Create the user and login details within the same transaction
        const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
        }, { transaction });

        const hashedPassword = generateHashedPassword(password);

        const loginDetail = await LoginDetail.create({
            userId: newUser.id,
            email: email,
            roleId: roleId,
            password: hashedPassword,
        }, { transaction });

        // Commit the transaction if both create calls succeed
        await transaction.commit();

        res.json({ userData: newUser, loginData: loginDetail });
    } catch (error) {
        // Rollback transaction if there was an error
        await transaction.rollback();

        // Handle any validation or other errors
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
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