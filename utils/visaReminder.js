const calculateExpDays = require('./CalculateExpDays');
const { Employee, Visa, Health, Agent } = require('../models');
const sendMail = require('./sendMail');

module.exports = async() => {
    try {
        const visas = await Visa.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        }});
    
        if (visas.length > 0) {
            const expiryVisas = visas.map(visa => {
                const daysUntilExpiry = calculateExpDays(visa.expiryDate);
    
                // Return passport object with daysUntilExpiry added
                return {
                    visa,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry <= 90);
    

            if(expiryVisas.length > 0){
                expiryVisas.map(visa => {
                    const receiver = visa.visa.Employee.email;
                    const subject = 'VISA EXPIRY REMINDER';
                    // Construct HTML table
                    let htmlMessage = `
                        <h2>Your Visa is due to expire</h2>
                        <p><b>Identification No.:</b> ${visa.visa.viId}</p>
                        <p><b>Reference no.:</b> ${visa.visa.referenceNo}</p>
                        <p><b>Status:</b> ${visa.visa.status}</p>
                        <p><b>Issue Date:</b> ${visa.visa.issueDate}</p>
                        <p><b>Expiry Date:</b> ${visa.visa.expiryDate}</p>
                        <p><b>Days until expiry:</b> ${visa.daysUntilExpiry}</p>
                        <br>
                        <h4>Please renew</h4>
                    `;
            
                    sendMail({receiver, subject, htmlMessage})
                })
            }       
        }   
    } catch (error) {
        console.err(error)
    }
}