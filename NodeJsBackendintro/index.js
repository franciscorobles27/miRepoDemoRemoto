const express = require('express');
const app = express();
const port = 3600;
app.use(express.json());

let data = [
    {id: 1, superhero: 'Batman'},
    {id: 2, superhero: 'Superman'},
    {id: 3, superhero: 'Spiderman'}
];

app.get('/', (req, res) => {

    return res.send('Hola mundo desde mi nodejs con nodemon');

});

app.get("/datos/", (req, res) => {
    return res.json(data );
});

app.get("/datos/superman", (req, res) => {
    return res.json(data [1] );
});

app.post("/add", (req, res) => {
    let nuevoHeroe = {
        id: data.length + 1,
        superhero: req.body.superhero
    };
    data.push(nuevoHeroe);
    return res.status(200).json(data);
});


app.listen(port, () => {
    console.log("Servidor http://localhost:" + port);
});