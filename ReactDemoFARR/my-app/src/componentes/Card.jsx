import React from 'react';
import '../estilos/card.css';
import yoshi from '../imagenes/yoshi.jpg';
import garfield from '../imagenes/garfield.webp';
import spiderman from '../imagenes/spiderman.webp';

const imagenes = {
  yoshi,
  garfield,
  spiderman
};

function Card(props) {
  return (
      <div className='contenido-card'>
        <img
          className='imagen-card'
          src={imagenes[props.imagen]}
          alt='Foto de ${props.nombre}'
        />
        <div className='contenedor-texto-card'>
          <p className='nombre-card'>
            <strong>{props.nombre}</strong>
          </p>
          <p className='pais-card'>
            {props.pais}
          </p>
          <p className='texto-card'>
            {props.contenido}
          </p>
        </div>
      </div>
  );
}

export default Card;