const { verify } = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get header token from client header
        const tokenFromClientHeader = req.get("loginToken");

        // Compare tokens and return stored user object
        const authenticatedUser = verify(tokenFromClientHeader, 'loginToken');

        // Check if the object is null
        if (authenticatedUser) {
            // Register the object in request parameter
            req.authenticatedUser = authenticatedUser;

            // Check if the request method is DELETE
            if (req.method === 'DELETE') {
                // Assuming authenticatedUser has a property indicating user role/permissions
                // You can customize this according to your authentication and authorization logic
                if (authenticatedUser.loginInfo.UserRole.roleName !== 'admin') { // Example condition: User is not an admin
                    return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
                }
            }

            // Continue to execute the controller method
            next();
        } else {
            return res.status(401).json({ error: 'Unauthenticated User' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
