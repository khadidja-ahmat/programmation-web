import { Schema, model } from 'mongoose';

// Un utilisateur : un email unique et un mot de passe (stocké haché, jamais en clair)
const userSchema = new Schema({
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export default model('User', userSchema);
