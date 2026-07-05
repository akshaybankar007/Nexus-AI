const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    goals: [String],
    skills: [string],
    personalNotes: string
});
module.exports = mongoose.model('User', UserSchema);