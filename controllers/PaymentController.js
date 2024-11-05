const {
    Payment,
    Loan,
    LoanStatus,
    PaymentInit,
    Employee
} = require('../models')
const { Op } = require('sequelize');

const datePart = require('../utils/datePart')


const addInitialPayment = async (req, res) => {
    try {
        const { year, employeeId, amount } = req.body
        const amountWithNoCommas = amount.replace(/,/g, '');

        const exist = await PaymentInit.findOne({
            where: {
                year, employeeId
            }
        })

        if(exist){
            return res.status(500).json({error: "Already exist"})
        }else{
            const data = await PaymentInit.create({year, employeeId, amount: amountWithNoCommas})

            if(data){
                res.json(data)
            }else{
                res.status(500).json({error: "Nothing to show"})
            }
        }
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const editInitialPayment = async (req, res) => {
    try {
        const { id, year, employeeId, amount } = req.body
        const amountWithNoCommas = amount.replace(/,/g, '');

        const data = await PaymentInit.update({year, employeeId, amount: amountWithNoCommas}, {
            where: {
                id
            }
        })

   
        res.json({status: data})
          
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const getInitialPayment = async (req, res) => {
    try {
        const { employeeId } = req.params

        const data = await PaymentInit.findAll({
            where: {
                employeeId
            }
        })

        res.json(data)
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const updateInitialPayment = async (req, res) => {
    try {
        const { year, employeeId, amount, id } = req.body
        
        const updated = await PaymentInit.update({
            year, employeeId, amount
        }, {
            where: {
                id
            }
        })

        res.json({updated})
        
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const deleteInitialPayment = async (req, res) => {
    try {
        const { id } = req.params
        
        const deleted = await PaymentInit.destroy({
            where: {
                id
            }
        })

        res.json({deleted})
        
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

/**
 * Handles making a payment.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The payment object or an error response.
 */
const makePayment = async (req, res) => {
    try {
        const {employeeId, year, amount, dateOfPayment, paymentMode, referenceNumber, otherDetails} = req.body;

        const amountWithNoCommas = amount.replace(/,/g, '')

        // Fetching loan details
        const paymentInit = await PaymentInit.findOne({
            where: {
                employeeId,
                year
            },
            include: [Payment]
        });

        // Checking for negative amount
        if (parseFloat(amountWithNoCommas) < 0) {
            return res.status(500).json({error: "Negative amount is not allowed"});
        }

        if (paymentInit) {
            // Fetching existing payments
            const payments = paymentInit.Payments
          
            const paybackAmount = paymentInit.amount;

            if (payments.length > 0) {
                const amounts = payments.map((payment) => {
                    return parseFloat(payment.amount);
                });

                //return res.json(amounts)

                // Calculating total payments
                const totalPayments = amounts.reduce((total, current) => total + current, 0);
                const balance = paybackAmount - totalPayments;

                if (balance === 0) {
                    return res.status(500).json({error: `This profile does not have a balance`});
                } else if (balance < amountWithNoCommas) {
                    return res.status(500).json({error: `Balance is only ${balance}`});
                }

                // Inserting payment
                const payment = await insert({amount: amountWithNoCommas, dateOfPayment: datePart(dateOfPayment), paymentMode, referenceNumber, otherDetails, paymentId: paymentInit.id});

                if (payment) {
                    return res.json(payment);
                } else {
                    return res.status(500).json({error: "Failed to add payment"});
                }
            } else {
                if (parseFloat(amountWithNoCommas) > paybackAmount) {
                    return res.status(500).json({error: `Amount entered is greater than payback amount ${paybackAmount}`});
                }

                // Inserting payment
                const payment = await insert({amount: amountWithNoCommas, dateOfPayment: datePart(dateOfPayment), paymentMode, referenceNumber, otherDetails, paymentId: paymentInit.id});

                if (payment) {
                    return res.json(payment);
                } else {
                    return res.status(500).json({error: "Failed to add payment"});
                }
            }
            
        } else {
            return res.status(500).json({error: 'Loan does not exist'});
        }
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const editPayment = async (req, res) => {
    console.log(req.body)
    try {
        const {employeeId, year, amount, dateOfPayment, paymentMode, referenceNumber, otherDetails, id} = req.body.updated;

        const amountWithNoCommas = parseFloat(amount.replace(/,/g, ''))

        // Fetching loan details
        const paymentInit = await PaymentInit.findOne({
            where: {
                employeeId,
                year
            },
            include: [Payment]
        });

        // Checking for negative amount
        if (amountWithNoCommas < 0) {
            return res.status(500).json({error: "Negative amount is not allowed"});
        }

        if (paymentInit) {
            // Fetching existing payments
            const payments = paymentInit.Payments
          
            const paybackAmount = paymentInit.amount;

            if (payments.length > 0) {
                const amounts = payments.map((payment) => {
                    return parseFloat(payment.amount);
                });

                //return res.json(amounts)

                // Calculating total payments
                const totalPayments = amounts.reduce((total, current) => total + current, 0);
                const balance = paybackAmount - totalPayments;

                if (balance === 0) {
                    return res.status(500).json({error: `This profile does not have a balance`});
                } else if (balance < amountWithNoCommas) {
                    return res.status(500).json({error: `Balance is only ${balance}`});
                }

                // Inserting payment
                const payment = await update({employeeId, amount: amountWithNoCommas, dateOfPayment: datePart(dateOfPayment), paymentMode, referenceNumber, otherDetails, paymentId: paymentInit.id, id});

                return res.json({status: payment})
            } else {
                if (parseFloat(amountWithNoCommas) > paybackAmount) {
                    return res.status(500).json({error: `Amount entered is greater than payback amount ${paybackAmount}`});
                }

                // Inserting payment
                const payment = await update({employeeId, amount: amountWithNoCommas, dateOfPayment: datePart(dateOfPayment), paymentMode, referenceNumber, otherDetails, paymentId: paymentInit.id, id});
                
                return res.json({status: payment})
            }
            
        } else {
            return res.status(500).json({error: 'Loan does not exist'});
        }
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

/**
 * Handles editing a payment.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The updated payment status or an error response.
 */
const edit = async (req, res) => {
    try {
        const bodyData = req.body;

        // Updating payment details
        const updated = await Payment.update({
                amount: bodyData.amount,
                paymentMode: bodyData.paymentMode,
                dateOfPayment: bodyData.dateOfPayment,
                referenceNumber: bodyData.referenceNumber,
                otherDetails: bodyData.otherDetails,
            },
            {
                where: {
                    id: bodyData.id
                }
            });

        return res.json({status: updated});
    
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

/**
 * Retrieves a payment by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The retrieved payment or an error response.
 */
const getPayment = async (req, res) => {
    // try {
    //     const {paymentId, loanId} = req.params;
    //     const authUser = req.auth_user.user;

    //      // Validating loan ownership
    //     const validateOwner = await ValidateLoanOwnership(loanId, authUser);

    //     if (validateOwner === "continue") {
    //         const payment = await Payment.findByPk(paymentId, {
    //             include: {
    //                 model: Loan,
    //                 include: [LoanStatus]
    //             }
    //         });

    //         if(payment){
    //             res.json(payment)
    //         }else{
    //             return res.status(500).json({error: "Payment does not exist"})
    //         }
    //     } else {
    //         return res.status(500).json(validateOwner);
    //     }

    // } catch (error) {
    //     if (error.errors) {
    //         const error_message = error.errors.map(err => err.message);
    //         res.status(500).json({error: error_message[0]});
    //     } else {
    //         res.status(500).json({error: error.message});
    //     }
    // }

}

/**
 * Retrieves payments associated with a loan.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The retrieved payments or an error response.
 */
const getPayments = async (req, res) => {
    try {

        const { employeeId, year } = req.params

        // Fetching loan details
        const paymentInit = await PaymentInit.findOne({
            where: {
                employeeId,
                year
            },
            include: [Payment, Employee]
        });

        return res.json(paymentInit);
    
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const getPaymentsWithBalance = async (req, res) => {
    try {

        const { employeeId, year } = req.params

        // Fetching loan details
        const paymentInit = await PaymentInit.findOne({
            where: {
                employeeId,
                year
            }, 
            include: [Payment, Employee]
        });

        if (paymentInit) {
            // Fetching existing payments
            const payments = paymentInit.Payments

            //return res.json(payments)

            const paybackAmount = paymentInit.amount;

            const amounts = payments.map((payment) => {
                return parseFloat(payment.amount);
            });

            //return res.json(amounts)

            // Calculating total payments
            const totalPayments = amounts.reduce((total, current) => total + current, 0);
            const balance = paybackAmount - totalPayments;

            return res.json({payments, totalPayments, balance, employee: paymentInit.Employee})
        
            
        } else {
            return res.status(500).json({error: 'Initial payments do not exist'});
        }
    
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

const getAllPaymentsWithBalance = async (req, res) => {
    try {
        // Fetching loan details
        const paymentInits = await PaymentInit.findAll({
            include: [Payment, Employee] // Include the Payment model
        });

        if (paymentInits.length > 0) {
            const paymentDetails = paymentInits.map(paymentInit => {

                // Extract payment amounts
                const paymentAmounts = paymentInit.Payments.map(payment => parseFloat(payment.amount));
                // Calculate total payments
                const totalPayments = paymentAmounts.reduce((total, current) => total + current, 0);
                // Calculate balance
                const balance = parseFloat(paymentInit.amount) - totalPayments;

                return {
                    paymentInit,
                    totalPayments,
                    balance,
                };
            });

            return res.json(paymentDetails);
        } else {
            return res.status(500).json({ error: 'Initial payments do not exist' });
        }
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            return res.status(500).json({ error: error_message[0] });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
}


/**
 * Deletes a payment.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The deletion status or an error response.
 */
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Payment.destroy(
            {
                where: {
                    id
                }
            }
        );

        if(deleted){
            return res.json({message: "Deleted Successfully"})
        }else{
            return res.status(500).json({error: "Failed to delete - The payment may not exist"})
        }
   
    } catch (error) {
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({error: error_message[0]});
        } else {
            res.status(500).json({error: error.message});
        }
    }
}

// Define an asynchronous function to retrieve all payments and group them by month and year
const getAllPaymentsByMonthAndYear = async (req, res) => {
    try {
        // Retrieve all payments from the database
        const payments = await Payment.findAll({
            where: {
                paymentId: {
                    [Op.ne]: null
                }
            }
        });

        // Group the payments by month and year
        const groupedPayments = payments.reduce((acc, payment) => {
            // Extract the month and year from the payment date
            const date = new Date(payment.dateOfPayment);
            const month = date.toLocaleString('default', { month: 'long' }); // Get month name
            const year = date.getFullYear(); // Get year

            // Initialize the year if it doesn't exist in the accumulator
            if (!acc[year]) {
                acc[year] = { total: 0, months: {} }; // Initialize year object with total and months
            }

            // Initialize the month if it doesn't exist in the year object
            if (!acc[year].months[month]) {
                acc[year].months[month] = { total: 0, payments: [] }; // Initialize month object with total and payments array
            }

            // Add the payment to the corresponding month
            acc[year].months[month].payments.push(payment);
            // Add the payment amount to the total for the month
            acc[year].months[month].total += parseFloat(payment.amount);
            // Add the payment amount to the total for the year
            acc[year].total += parseFloat(payment.amount);

            return acc;
        }, {});

        // Send the grouped payments as JSON response
        res.json(groupedPayments);
    } catch (error) {
        // Handle errors
        if (error.errors) {
            const error_message = error.errors.map(err => err.message);
            res.status(500).json({ error: error_message[0] });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

/**
 * Inserts a payment into the database.
 * @param {object} body - The payment data.
 * @returns {object} - The inserted payment object.
 */
const insert = async body => {
    const payment = await Payment.create(body);
    return payment;
}

const update = async body => {
    const payment = await Payment.update(body, {
        where: {
            id: body.id
        }
    });
    return payment;
}

module.exports = {
    makePayment,
    edit,
    getPayment,
    getPayments,
    deletePayment,
    addInitialPayment,
    updateInitialPayment,
    deleteInitialPayment,
    getPaymentsWithBalance,
    getAllPaymentsWithBalance,
    getInitialPayment,
    editInitialPayment,
    editPayment,
    getAllPaymentsByMonthAndYear,
}
