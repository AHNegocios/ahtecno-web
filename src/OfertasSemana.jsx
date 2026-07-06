// src/OfertasSemana.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Producto from './Producto';

function OfertasSemana() {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    async function fetchDestacados() {
      const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOfertas(data);
      }
    }
    fetchDestacados();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--fondo-pagina)', minHeight: '100vh', color: 'var(--texto-principal)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', transition: 'all 0.3s ease' }}>
      
      {/* 1. FOTO Y BIO */}
      <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '3px solid #00e5ff', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', marginBottom: '15px', overflow: 'hidden' }}>
        <img src="/LogoAHTecno.png" alt="A&H Tecno" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
      </div>
      
      <h1 style={{ fontSize: '2.2rem', margin: '0 0 5px 0', color: 'var(--color-primario)', fontWeight: '900' }}>
        A&H Tecno
      </h1>
      <p style={{ color: 'var(--texto-secundario)', marginBottom: '35px', textAlign: 'center', maxWidth: '350px', fontSize: '1.1rem' }}>
        ⚡ Nuestras mejores selecciones para tu setup.
      </p>

      {/* 2. BOTONES DE ACCIÓN (ACÁ ARRIBA DE LA GRILLA) */}
      <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '600px', marginBottom: '50px' }}>
        <Link to="/productos" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ border: '1px solid #00e5ff', color: 'var(--color-primario)', padding: '14px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s', backgroundColor: 'rgba(0, 229, 255, 0.03)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🌐 Catálogo Completo
          </div>
        </Link>
        <Link to="/comunidad" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ border: '1px solid var(--borde-tarjeta)', color: 'var(--texto-secundario)', padding: '14px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.3s', backgroundColor: 'var(--fondo-tarjeta)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👥 Comunidad
          </div>
        </Link>
      </div>

      {/* 3. GRILLA DE PRODUCTOS */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grilla-productos" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 250px))', gap: '25px', width: '100%', justifyContent: 'center', margin: '0 auto' }}>          {ofertas.map((producto, index) => (
            <Producto
              key={producto.id}
              titulo={producto.titulo}
              precio={producto.precio}
              linkOferta={producto.link}
              imagen={producto.imagen}
              ml_id={producto.ml_id}
              esPrimero={index === 0} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default OfertasSemana;