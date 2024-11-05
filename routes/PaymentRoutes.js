const express = require('express');
const { 
    makePayment, 
    edit,
    deletePayment,
    getPayment,
    getPayments,
    addInitialPayment,
    updateInitialPayment,
    deleteInitialPayment,
    getPaymentsWithBalance,
    getAllPaymentsWithBalance,
    getInitialPayment,
    editInitialPayment,
    editPayment,
    getAllPaymentsByMonthAndYear,
} = require('../controllers/PaymentController');
const auth = require('../middleware/AuthMiddleware')

const router = express.Router();

router.post('/addInitialPayment', auth, addInitialPayment)

router.put('/editInitialPayment', auth, editInitialPayment)

router.put('/updateInitialPayment', auth, updateInitialPayment)

router.delete('/deleteInitialPayment/:id', auth, deleteInitialPayment)

router.post('/makePayment', auth, makePayment)

router.put('/editPayment', auth, editPayment)

router.get('/getPayment/:paymentId/:loanId', auth, getPayment);

router.get('/getInitialPayment/:employeeId', auth, getInitialPayment);

router.get('/getPayments/:employeeId/:year', auth, getPayments);

router.get('/getPaymentsWithBalance/:employeeId/:year', auth, getPaymentsWithBalance);

router.get('/getAllPaymentsWithBalance', auth, getAllPaymentsWithBalance);

router.put('/edit', auth, edit);

router.delete('/deletePayment/:id', auth, deletePayment);

router.get('/getGroupedPayments', auth, getAllPaymentsByMonthAndYear);

module.exports = router;