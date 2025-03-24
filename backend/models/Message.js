const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
text: {
type: String,
required: true
},
user: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User'
},
room: {
type: String,
default: 'general'
},
timestamp: {
type: Date,
default: Date.now
}
});

module.exports = mongoose.model('Message', MessageSchema);