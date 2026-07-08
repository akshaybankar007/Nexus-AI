const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    goals: [String],
    skills: [String], 
    personalNotes: String
});

module.exports = mongoose.model('User', UserSchema);