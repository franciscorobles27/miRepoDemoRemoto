const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let registros = [
    {
        id: 1,
        nombre: 'Ana karina',
        email: 'ana@ucc.mx',
        genero: 'Femenino',
        plataformas:["Netflix", "Prime"]
    },

    {
        id: 2,
        nombre: 'Francisco Robles',
        email: '201120012@ucc.mx',
        genero: 'Masculino',
        plataformas:["Disney+", "HBO"]
    }


];

let idActual = 3;

app.get('/api/usuarios', (req, res) => {
    res.json(registros);
});

app.post('/api/usuarios', (req, res) => {
    const nuevoRegistro = {
        id: idActual++,
        nombre: req.body.nombre,
        email: req.body.email,
        genero: req.body.genero,
        plataformas: req.body.plataformas
    };
    registros.push(nuevoRegistro);
    res.json(nuevoRegistro);
});

app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = registros.find(r => r.id === id);
})


app.listen(port, () => {
    console.log('Listening at http://localhost:${port}');
});