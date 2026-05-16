import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Card from './componentes/Card.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Card 
    imagen="yoshi"
    nombre="Yoshi"
    pais="Japón"
    contenido="Es un dinosaurio verde que es el mejor amigo de Mario"
    />
    <Card 
    imagen="garfield"
    nombre="Garfield"
    pais="Estados Unidos"
    contenido="Es un gato naranja que vive con su dueño Jon y odia los lunes"
    />
    <Card 
    imagen="spiderman"
    nombre="spiderman"
    pais="Estados Unidos"
    contenido="Es un superhéroe que tiene habilidades de araña y protege la ciudad de New York"
    />
  </StrictMode>,
)
