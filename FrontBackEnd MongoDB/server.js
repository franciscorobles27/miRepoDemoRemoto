const express = require('express');
const cors = require('cors');
const mongoose=require("mongoose");

const Usuario = require("./Models/Usuario.js");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//MongoDB
mongoose.connect("mongodb://Robles:chester1009@ac-p1uswwu-shard-00-00.orgcka0.mongodb.net:27017,ac-p1uswwu-shard-00-01.orgcka0.mongodb.net:27017,ac-p1uswwu-shard-00-02.orgcka0.mongodb.net:27017/?ssl=true&replicaSet=atlas-5phq30-shard-0&authSource=admin&appName=Cluster0")
.then(()=>{console.log("MongoDB Ready!")})
.catch(err=>console.log(err));


app.post('/api/usuarios', async (req, res) => {
    const nuevo = new Usuario (
        {
            nombre: req.body.nombre,
            email: req.body.email,
            genero: req.body.genero,
            plataformas: req.body.plataformas
        }
    )
    const guardado = await nuevo.save();
    res.json(guardado);
});

app.get('/api/usuarios', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

app.put('/api/usuarios/:id', async (req, res) => {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
        req.params.id,
        {
            nombre: req.body.nombre,
            email: req.body.email,
            genero: req.body.genero,
            plataformas: req.body.plataformas
        },
        {new: true}
    );

    res.json(usuarioActualizado);
});


app.listen(port, () => {
    console.log('Listening at http://localhost:${port}');
});