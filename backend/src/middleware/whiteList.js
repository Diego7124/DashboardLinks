const admin = require('firebase-admin');

    const AllowedEmails = [
    'leticia.mellado@cielitoitsolutions.com',
    'eric.chavez@cielitoitsolutions.com',
    'alejandro.duran@cielitoitsolutions.com',
    'yessica.tovar@cielitoitsolutions.com',
    'paulina.gonzalez@cielitoitsolutions.com',
    'carlos.medina@cielitoitsolutions.com',
    'brandon.jaramillo@cielitoitsolutions.com',
    'luis.gallo@cielitoitsolutions.com',
    'carmen.viramontes@cielitoitsolutions.com',
    'jonathan.vazquez@cielitoitsolutions.com',
    'lenin.silva@cielitoitsolutions.com',
    'diego.luna@cielitoitsolutions.com',
    ];


function VerifyWhitelistEmail(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        admin.auth().verifyIdToken(token)
            .then((decodedToken) => {
            const userEmail = (decodedToken.email || '').trim().toLowerCase();
            const allowed = AllowedEmails.map(e => e.trim().toLowerCase());
            console.log('Email recibido:', userEmail);
            console.log('Whitelist:', allowed);
            if (allowed.includes(userEmail)) {
                req.user = decodedToken;
                next();
            } else {
                res.status(403).json({ message: 'Forbidden: Email not in whitelist' });
            }
        })
            .catch((error) => {
                res.status(401).json({ message: 'Unauthorized: Invalid token' });
            });
}

module.exports = {
    VerifyWhitelistEmail,
};
