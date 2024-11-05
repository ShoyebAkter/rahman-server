const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the directory where uploaded files will be stored
const { 
    getEmployees, 
    getOne, 
    add, 
    editEmployee, 
    deleteEmployee, 
    getActiveAndInactiveEmp, 
    getExpirePassports, 
    getExpireVisa, 
    uploadFile,
    deleteFile,
    getAttachments,
    updatePersonalInfo,
    updateEmergencyContact,
    updateAgentInfo,
    updateHealthInfo,
    updatePassport,
    addPassport,
    deletePassport,
    getOnly,
    deleteVisa,
    updateVisa,
    addVisa,
    getExpiredPassports,
    getExpiredVisa
} = require('../controllers/EmployeeController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

// Routes without file upload
router.get('/', getEmployees);
router.get('/getOnly/:agentId', AuthMiddleware, getOnly);
router.get('/getOne/:id', AuthMiddleware, getOne);
router.get('/getActiveAndInactive', AuthMiddleware, getActiveAndInactiveEmp);
router.get('/getAttachments/:id', AuthMiddleware, getAttachments);
router.get('/passportExpire', AuthMiddleware, getExpirePassports);
router.get('/visaExpire', AuthMiddleware, getExpireVisa);
router.get('/passportExpired', AuthMiddleware, getExpiredPassports);
router.get('/visaExpired', AuthMiddleware, getExpiredVisa);
router.post('/add', AuthMiddleware, add);
router.post('/addPassport', AuthMiddleware, addPassport);
router.post('/addVisa', AuthMiddleware, addVisa);
router.put('/editEmployee', AuthMiddleware, editEmployee);
router.put('/updatePersonalInfo', AuthMiddleware, updatePersonalInfo);
router.put('/updateEmergencyContact', AuthMiddleware, updateEmergencyContact);
router.put('/updateHealthInfo', AuthMiddleware, updateHealthInfo);
router.put('/updatePassport', AuthMiddleware, updatePassport);
router.put('/updateVisa', AuthMiddleware, updateVisa);
router.delete('/delete/:id', AuthMiddleware, deleteEmployee);
router.delete('/deletePassport/:id', AuthMiddleware, deletePassport);
router.delete('/deleteVisa/:id', AuthMiddleware, deleteVisa);

// Routes for file upload
router.post('/addFile', AuthMiddleware, upload.single('fileAttachment'), uploadFile);
router.delete('/deleteFile/:fileId', AuthMiddleware, deleteFile);

module.exports = router;
