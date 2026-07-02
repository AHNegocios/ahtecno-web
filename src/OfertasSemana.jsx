// src/OfertasSemana.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Producto from './Producto'; // Usamos el componente Producto que ya tiene el modal integrado

function OfertasSemana() {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    async function fetchDestacados() {
      const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('created_at', { ascending: false }); // Trae todos los cargados de forma ilimitada

      if (!error && data) {
        setOfertas(data);
      }
    }
    fetchDestacados();
  }, []);

  return (
    <div style={{ backgroundColor: '#0d0d12', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>

      {/* FOTO Y BIO */}
      <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '3px solid #00e5ff', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', marginBottom: '15px', overflow: 'hidden' }}>
        <img src="/LogoAHTecno.png" alt="A&H Tecno" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
      </div>
      
      <h1 style={{ fontSize: '2.2rem', margin: '0 0 5px 0', color: '#00e5ff', fontWeight: '900' }}>
        A&H Tecno
      </h1>
      <p style={{ color: '#aaaaaa', marginBottom: '35px', textAlign: 'center', maxWidth: '350px', fontSize: '1.1rem' }}>
        ⚡ Nuestras mejores selecciones para tu setup.
      </p>

      {/* BOTONES DE ACCIÓN DE DOS COLUMNAS MINIMALISTAS */}
      <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '600px', marginBottom: '50px' }}>
        <Link to="/productos" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ border: '1px solid #00e5ff', color: '#00e5ff', padding: '14px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s', backgroundColor: 'rgba(0, 229, 255, 0.03)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🌐 Catálogo Completo
          </div>
        </Link>
        <Link to="/comunidad" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ border: '1px solid #333333', color: '#aaaaaa', padding: '14px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s', backgroundColor: '#1e1e24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👥 Comunidad
          </div>
        </Link>
      </div>

      {/* GRILLA DE PRODUCTOS EXPANDIDA ALINEADA A LA IZQUIERDA */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grilla-productos">
          {ofertas.map((producto, index) => (
            <Producto
              key={producto.id}
              titulo={producto.titulo}
              precio={producto.precio}
              linkOferta={producto.link}
              imagen={producto.imagen}
              ml_id={producto.ml_id}
              // Pasamos una propiedad para saber cuál es el primero de la lista
              esPrimero={index === 0} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default OfertasSemana;