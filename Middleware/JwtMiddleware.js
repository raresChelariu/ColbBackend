const jwtMiddleware = require('jsonwebtoken');
const secret = process.env.JWT_SECRET
const timeExpiresIn = process.env.JWT_TOKEN_EXPIRATION_IN_SECONDS

class JwtMiddleware {
    static Sign(payload, expiresIn = timeExpiresIn) {
        // expiresIn - number of seconds after which it will expire
        payload['exp'] = parseInt(Math.floor(Date.now() / 1000) + expiresIn);
        return jwtMiddleware.sign(payload, secret);
    }

    static Verify(token) {
        return jwtMiddleware.verify(token, secret);
    }

    static GetSecret = () => secret

    static AuthorizedRequest(req, res) {
        const authHeader = req.GetHeaders()['authorization'];
        // Header is in format of 'Bearer TOKEN_VALUE_HERE'
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.Unauthorized('No authorization!');
            return false;
        }
        try {
            req['Account'] = JwtMiddleware.Verify(token);
            return true;
        } catch (err) {
            res.Unauthorized(err.toString());
            return false;
        }
    }
}

module.exports = JwtMiddleware