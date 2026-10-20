// Here I will get the current user data from the request object and return it. This is useful for routes that require authentication and need to know which user is making the request.

//Based on access token, we can get the user data from the request object. This is useful for routes that require authentication and need to know which user is making the request.

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function getCurrentUser(req) {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    if (!token || !process.env.JWT_SECRET) {
        return null;
    }

    let claims;
    try {
        claims = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }

    if (!claims.sub || !claims.sid) return null;

    const session = await prisma.authSession.findFirst({
        where: {
            id: claims.sid,
            userId: claims.sub,
            revokedAt: null,
            expiresAt: { gt: new Date() },
        },
        include: { user: true },
    });
    if (!session) return null;

    const { id, firstName, lastName, email } = session.user;
    return { id, firstName, lastName, email };
}

async function setUserInContext(req, user) {
    const currentUser = await getCurrentUser(req);
    return currentUser ? { ...currentUser, ...user } : null;
}

module.exports = {
    getCurrentUser,
    setUserInContext
};