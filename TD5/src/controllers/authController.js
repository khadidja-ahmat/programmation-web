import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Crée un nouvel utilisateur (le mot de passe est haché avant l'enregistrement)
export async function registerUser(body) {
    try {
        if (!body || !body.email || !body.password) {
            return { success: false, message: "Email and password are required" };
        }

        // 10 = nombre de "tours" de hachage (coût de calcul)
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await User.create({ email: body.email, password: hashedPassword });

        // On ne renvoie JAMAIS le mot de passe, même haché
        return { success: true, data: { _id: user._id, email: user.email } };
    } catch (err) {
        if (err.code === 11000) {
            return { success: false, message: "Email already used" };
        }
        return { success: false, message: "User not registered " + err };
    }
}

// Vérifie les identifiants et renvoie un JWT
export async function loginUser(body) {
    try {
        if (!body || !body.email || !body.password) {
            return { success: false, message: "Email and password are required" };
        }

        const user = await User.findOne({ email: body.email });
        // Même message si l'email n'existe pas ou si le mot de passe est faux :
        // on ne révèle pas lequel des deux est incorrect
        if (!user) {
            return { success: false, message: "Invalid credentials" };
        }

        const ok = await bcrypt.compare(body.password, user.password);
        if (!ok) {
            return { success: false, message: "Invalid credentials" };
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { success: true, token: token };
    } catch (err) {
        return { success: false, message: "Login failed " + err };
    }
}
