const { Employee, 
    EmergencyContact, 
    Agent, 
    Health,
    Passport,
    Visa,
    Attachment,
    sequelize,
    PaymentInit,
    Payment, 
} = require('../models')
const bcrypt = require('bcryptjs')
const sendMail = require('../utils/sendMail')
const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')
const calculateExpDays = require('../utils/CalculateExpDays')
const datePart = require('../utils/datePart')
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = process.env.REDIRECT_URL
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const FOLDER_ID= process.env.FOLDER_ID

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URL
)

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [EmergencyContact, Agent, Health, Passport, Visa],
            order: [['id', 'DESC']],
        })
        res.json(employees)
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

const getOnly = async (req, res) => {
    try {
        const {agentId} = req.params
        const employees = await Employee.findAll({
            include: [EmergencyContact, Agent, Health, Passport, Visa, {
                model: PaymentInit,
                include: Payment
            }],
            where: {
                agentId
            }
        })

        const profiles = employees.map(emp => {

            return {
                emp, 
                balance: getBalances(emp)
            }


            if(emp.PaymentInits.length > 0){

                const inits = emp.PaymentInits.map(init => {

                    if(init.Payments.length > 0){
                        const paymentAmounts = init.Payments.map(payment => parseInt(payment?.amount));
                        // Calculate total payments
                        const totalPayments = paymentAmounts.reduce((total, current) => total + current, 0);
                        // Calculate balance
                        const balance = parseInt(init.amount) - totalPayments;

                        return {
                            emp,
                            balance
                        }
                    }else{
                        return emp
                    }
                    
                })
                
                return inits[0]
              
            }else{
                return emp
            }
            return {
                emp,
                balance,
            };
        })

        return res.json(profiles);
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

const getBalances = profile => {
    if(profile.PaymentInits.length === 0){
        return {
            balance: "",
            status: "No Payments"
        }
    }

    const balances = profile.PaymentInits.map(init => {
        const addUp = 0

        if(init.Payments.length > 0){
            const paymentAmounts = init.Payments.map(payment => parseInt(payment?.amount));
            // Calculate total payments
            const totalPayments = paymentAmounts.reduce((total, current) => total + current, 0);
            // Calculate balance
            return parseInt(init.amount) - totalPayments;
        }else{
            return parseInt(init.amount)
        }
    })
    
    const totalBalance = balances.reduce((total, current) => total + current, 0);
    return {
        balance: totalBalance,
        status: totalBalance === 0 ? "Payment Completed" : "Incomplete Payment"
    }
    
}

const getActiveAndInactiveEmp = async (req, res) => {
    try {
        const activeEmp = await Employee.findAll({
            where: {
                status: "active"
            },
            include: [EmergencyContact, Agent, Health, Passport, Visa]
        })

        const inActiveEmp = await Employee.findAll({
            where: {
                status: "Inactive"
            },
            include: [EmergencyContact, Agent, Health, Passport, Visa]
        })

        return res.json({activeEmp, inActiveEmp})

    } catch (error) {
        if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
}

const getOne = async (req, res) => {
    try {
        const {id} = req.params

        const emp = await Employee.findByPk(id, {
            include: [EmergencyContact, Agent, Health, Passport, Visa]
        })

        if(emp){
            res.json(emp)
        }else{
            res.status(500).json({error: "Info not found"})
        }
    } catch (error) {
        if(error.errors){
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        }else{
            res.status(500).json({error: error.message})
        }
    }
}

const add = async (req, res) => {
    // Extracting relevant data from the request body
    const { 
        firstName, 
        lastName, 
        DOB, 
        nationality, 
        mobile,
        email,
        idNo,
        telephone,
        status, 
        emName, 
        emMobile, 
        emTelephone,
        bloodGroup,
        agentId,
        paNo,
        paIssueDate,
        paExpDate,
        viRefNo,
        viIssueDate,
        viExpDate, 
        viStatus,
        viId,
    } = req.body;

    const authUser = req.authenticatedUser.loginInfo.User

    try {
        // If user does not exist, create a new user
        const newEmp = await Employee.create({
            firstName,
            lastName,
            DOB,
            nationality,
            mobile,
            email: email.length === 0 ? process.env.ADMIN_EMAIL : email,
            idNo,
            telephone,
            status,
            agentId,
            userId: authUser.id
        });
    
        // Use a transaction to ensure data consistency across multiple operations
        const transaction = await sequelize.transaction();

        try {
            const emergencyContact = await EmergencyContact.create({
                employeeId: newEmp.id,
                fullName: emName,
                mobile: emMobile,
                telephone: emTelephone,
            }, { transaction });

            const healthInfo = await Health.create({
                employeeId: newEmp.id,
                bloodGroup: bloodGroup,
            }, { transaction });

            const passportInfo = await Passport.create({
                employeeId: newEmp.id,
                passportNo: paNo,
                issueDate: datePart(paIssueDate),
                expiryDate: datePart(paExpDate),
            }, { transaction });

            const visaInfo = await Visa.create({
                employeeId: newEmp.id,
                viId,
                referenceNo: viRefNo,
                issueDate: datePart(viIssueDate),
                status: viStatus,
                expiryDate: datePart(viExpDate),
            }, { transaction });

            // Commit the transaction if all operations are successful
            await transaction.commit();

            // Respond with the created user and login details
            return res.json({ employeeInfo: newEmp, emergencyContact, healthInfo, passportInfo, visaInfo });

        } catch (error) {
            // Rollback the transaction if any operation fails
            await transaction.rollback();

            // Delete the user if login detail creation fails
            await Employee.destroy({ where: { id: newEmp.id } });

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

const editEmployee = (req, res) => {
    
}

const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id
        const authUser = req.authenticatedUser.loginInfo

        const deleted = await Employee.destroy({
            where: {id}
        })

        return res.json({message: deleted})
    
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

const getExpirePassports = async (req, res) => {
    try {
        const passports = await Passport.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        } });

        if (passports.length > 0) {
            const expiryPassports = passports.map(passport => {
                const daysUntilExpiry = calculateExpDays(passport.expiryDate);

                // Return passport object with daysUntilExpiry added
                return {
                    passport,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry <= 90 && entry.daysUntilExpiry > 0);

            return res.json({ passports: expiryPassports });
        }
        console.log()
        return res.json([]);
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const getExpiredPassports = async (req, res) => {
    try {
        const passports = await Passport.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        } });

        if (passports.length > 0) {
            const expiryPassports = passports.map(passport => {
                const daysUntilExpiry = calculateExpDays(passport.expiryDate);

                // Return passport object with daysUntilExpiry added
                return {
                    passport,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry < 0);

            return res.json({ passports: expiryPassports });
        }
        console.log()
        return res.json([]);
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const getExpireVisa = async (req, res) => {
    try {
        const visas = await Visa.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        } });

        if (visas.length > 0) {
            const expiryVisas = visas.map(visa => {
                const daysUntilExpiry = calculateExpDays(visa.expiryDate);

                // Return passport object with daysUntilExpiry added
                return {
                    visa,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry <= 90 && entry.daysUntilExpiry > 0);

            return res.json({ visas: expiryVisas });
        }

        return res.json([]);
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const getExpiredVisa = async (req, res) => {
    try {
        const visas = await Visa.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        } });

        if (visas.length > 0) {
            const expiryVisas = visas.map(visa => {
                const daysUntilExpiry = calculateExpDays(visa.expiryDate);

                // Return passport object with daysUntilExpiry added
                return {
                    visa,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry < 0 );

            return res.json({ visas: expiryVisas });
        }

        return res.json([]);
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const uploadFile = async (req, res) => {
    try {
        const { fileName, employeeId, fileTitle } = req.body;
        const filePath = req.file.path;

        if(!req.file){
            return res.status(500).json({error: "File not found"})
        }

        const maxSizeInBytes = 1 * 1024 * 1024; // Set the maximum allowed size to 1 MB

        // Check if file size exceeds the maximum allowed size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;

        if (fileSizeInBytes > maxSizeInBytes) {
            return res.status(500).json({ error: 'File size exceeds the maximum allowed size (1 MB)' });
        }

        // Process the file (e.g., upload it to Google Drive)
        const response = await drive.files.create({
            requestBody: {
                name: fileTitle,
                parents: [FOLDER_ID]
            },
            media: {
                body: fs.createReadStream(filePath)
            }
        });

        // Handle the response and database operations
        if (response.data) {
            const result = await generatePublicUrl(response.data.id);

            const attachment = await Attachment.create({
                fileName,
                fileTitle,
                employeeId,
                fileId: response.data.id,
                contentLink: result.webContentLink,
                fileUrl: result.webViewLink,
                localLocation: filePath
            });

            return res.json(attachment);
        }

        res.status(500).json(response);
    } catch (error) {
        console.log(error)
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

const getAttachments = async (req, res) => {
    try {
        const empId = req.params.id

        const attachments = await Attachment.findAll({
            where: {
                employeeId: empId
            }
        })

        res.json(attachments)
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
} 

const updatePersonalInfo = async (req, res) => {
    try {
        const { id, firstName, lastName, DOB, mobile, telephone, status, email, idNo, agentId } = req.body

        const updated = await Employee.update({
            firstName, lastName, DOB, telephone, status, mobile, email: email.length === 0 ? process.env.ADMIN_EMAIL : email, idNo, agentId,
        }, {
            where: {
                id
            }
        })
        return res.json({message: updated})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const updateEmergencyContact = async (req, res) => {
    try {
        const { id, fullName, mobile, telephone } = req.body

        const updated = await EmergencyContact.update({
            fullName, mobile, telephone
        }, {
            where: {
                id
            }
        })

        return res.json({message: updated})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const updateHealthInfo = async (req, res) => {
    try {
        const { id, bloodGroup } = req.body

        const updated = await Health.update({
            bloodGroup,
        }, {
            where: {
                id
            }
        })

        return res.json({message: updated})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const updatePassport = async (req, res) => {
    try {
        const { id, passportNo, issueDate, expiryDate } = req.body

        const updated = await Passport.update({
            passportNo, issueDate: datePart(issueDate), expiryDate: datePart(expiryDate)
        }, {
            where: {
                id
            }
        })

        return res.json({message: updated})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const updateVisa = async (req, res) => {
    try {
        const { id, viId, referenceNo, status, issueDate, expiryDate } = req.body

        const updated = await Visa.update({
            viId, referenceNo, status, issueDate: datePart(issueDate), expiryDate: datePart(expiryDate)
        }, {
            where: {
                id
            }
        })

        return res.json({message: updated})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const addPassport = async (req, res) => {
    try {
        const {employeeId, passportNo, issueDate, expiryDate } = req.body

        const passport = await Passport.create({
            employeeId,
            passportNo,
            issueDate: datePart(issueDate),
            expiryDate: datePart(expiryDate),
        })

        return res.json(passport)
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const addVisa = async (req, res) => {
    try {
        const {employeeId, viId, referenceNo, status, issueDate, expiryDate } = req.body

        const visa = await Visa.create({
            employeeId,
            referenceNo,
            viId,
            status,
            issueDate: datePart(issueDate),
            expiryDate: datePart(expiryDate),
        })

        return res.json(visa)
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params

        const deleted = await Attachment.destroy({
            where: {
                fileId
            }
        })

        const response = await drive.files.delete({
            fileId
        })

        return res.json({data:deleted, status:response.status})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const deletePassport = async (req, res) => {
    try {
        const { id } = req.params

        const deleted = await Passport.destroy({
            where: {
                id
            }
        })


        return res.json({data:deleted})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const deleteVisa = async (req, res) => {
    try {
        const { id } = req.params

        const deleted = await Visa.destroy({
            where: {
                id
            }
        })


        return res.json({data:deleted})
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => `For ${err.value} :` + err.message);
            res.status(500).json({ error: error_message.join(', ') });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

const generatePublicUrl = async id => {
    try {
        await drive.permissions.create({
            fileId: id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const result = await drive.files.get({
            fileId: id,
            fields: 'webViewLink, webContentLink'
        })

        return result.data;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getOnly,
    getEmployees,
    getOne,
    add,
    editEmployee,
    deleteEmployee,
    getActiveAndInactiveEmp,
    getExpirePassports,
    getExpireVisa,
    getExpiredPassports,
    getExpiredVisa,
    uploadFile,
    deleteFile,
    getAttachments,
    updatePersonalInfo,
    updateEmergencyContact,
    updateHealthInfo,
    updatePassport,
    addPassport,
    deletePassport,
    addVisa,
    updateVisa,
    deleteVisa,
}