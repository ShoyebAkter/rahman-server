const express = require('express')
const server = express()
const PORT = 3000
const cors = require('cors')
const models = require('./models')
require('dotenv').config();
const cron = require('node-cron');

const { 
    authRoute,
    userRoute, 
    userRoleRoute,
    employeeRoute,
    agentRoute,
    paymentRoute,
} = require('./routes')
const reminder = require('./utils/visaReminder')
const passportReminder = require('./utils/passportReminder')

server.use(express.json())
server.use(cors())

server.use("/auth", authRoute)
server.use("/user", userRoute)
server.use("/userRole", userRoleRoute)
server.use("/employee", employeeRoute)
server.use("/agent", agentRoute)
server.use("/payment", paymentRoute)

// Define your cron job schedule
const cronSchedule = '0 12 1,15 * *'; // Runs at midday on the 1st and 15th day of each month

//const cronSchedule = '*/5 * * * *'; // Runs every 5 minutes
  
// Create the cron job
cron.schedule(cronSchedule, reminder);

cron.schedule(cronSchedule, passportReminder);

models.sequelize.sync()
.then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
.catch(err => console.log(err))
