import jwt from 'jsonwebtoken';

// Middleware : vérifie le token JWT avant de laisser passer la requête
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Token missing" });
    }

    const token = authHeader.split(' ')[1];

    try {
        // verify lève une erreur si la signature est fausse ou si le token a expiré
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;   // on garde l'utilisateur pour la suite
        next();               // on laisse passer vers la vraie route
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalid or expired" });
    }
}
