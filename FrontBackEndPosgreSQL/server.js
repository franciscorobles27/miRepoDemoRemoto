const express = require('express');
const cors = require('cors');
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const {config} = require("dotenv");
config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

if(supabase)
    console.log("Supabase conectado con éxito");

app.get('/api/usuarios', async (req, res) => {
    const { data, error } = await supabase
    .from ('usuarios')
    .select('*');

    if(error) return res.status(500),json(error);
    res.json(data);

});

app.post('/api/usuarios', async (req, res) => {
    const { data, error} = await supabase
    .from('usuarios')
    .insert([
        {
            nombre: req.body.nombre,
            email: req.body.email,
            genero: req.body.genero,
            plataformas: req.body.plataformas
        }
    ])
    .select();

if (error) return res.status(500).json(error);
res.json(data[0]);
});


app.put('/api/usuarios/:id', async (req, res) => {
    const { data, error} =await supabase
    .from('usuarios')
    .update({
        nombre: req.body.nombre,
        email: req.body.email,
        genero: req.body.genero,
        plataformas: req.body.plataformas
    })
    .eq("id",req.params.id)
    .select();

    if(error) return res.status(500).json(error);

    res.json(data);
    
})


app.listen(port, () => {
    console.log('Listening at http://localhost:${port}');
});