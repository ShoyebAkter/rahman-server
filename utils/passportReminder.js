const calculateExpDays = require('./CalculateExpDays');
const { Employee, Health, Agent, Passport } = require('../models');
const sendMail = require('./sendMail');

module.exports = async() => {
    try {

        const passports = await Passport.findAll({ include: {
            model: Employee,
            include: [Health, Agent]
        }});

        if (passports.length > 0) {
            const expiryPassports = passports.map(passport => {
                const daysUntilExpiry = calculateExpDays(passport.expiryDate);
    
                // Return passport object with daysUntilExpiry added
                return {
                    passport,
                    daysUntilExpiry
                };
            }).filter(entry => entry.daysUntilExpiry <= 90);

            if(expiryPassports.length > 0){
                expiryPassports.map(passport => {
                    const receiver = passport.passport.Employee.email;
                    const subject = 'PASSPORT EXPIRY REMINDER';
                    // Construct HTML table
                    let htmlMessage = `
                        <h2>Your Passport is due to expire</h2>
                        <p><b>Passport No.:</b> ${passport.passport.passportNo}</p>
                        <p><b>Title holder.:</b> ${passport.passport.Employee.firstName + " " + passport.passport.Employee.lastName }</p>
                        <p><b>Agent Name.:</b> ${passport.passport.Employee.Agent.name}</p>
                        <p><b>Issue Date:</b> ${passport.passport.issueDate}</p>
                        <p><b>Expiry Date:</b> ${passport.passport.expiryDate}</p>
                        <p><b>Days until expiry:</b> ${passport.daysUntilExpiry}</p>
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