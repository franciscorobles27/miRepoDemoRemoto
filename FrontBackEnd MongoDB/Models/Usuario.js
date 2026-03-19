const mongoose = require('mongoose');
const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        
    },
    genero: {
        type: String,
        required: true
    },
    plataforms: {
        type: [String]
    }
});



module.exports = mongoose.model('Usuario', UsuarioSchema);