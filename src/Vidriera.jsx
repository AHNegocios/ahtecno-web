// src/Vidriera.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Conectamos a la base de datos

function Vidriera() {
  const [ofertas, setOfertas] = useState([]);
  const carruselRef = useRef(null);

  // El radar va a buscar tus productos a Supabase
  useEffect(() => {
    async function fetchUltimosIngresos() {
      const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('created_at', { ascending: false }) // Los ordena del más nuevo al más viejo
        .limit(5); // Traemos los 5 más recientes para el carrusel

      if (!error && data) {
        setOfertas(data);
      }
    }
    fetchUltimosIngresos();
  }, []);

  const moverCarrusel = (direccion) => {
    if (carruselRef.current) {
      const distancia = 320;
      carruselRef.current.scrollBy({ left: direccion === 'izq' ? -distancia : distancia, behavior: 'smooth' });
    }
  };

  // Formateador automático de moneda
  const formatearMoneda = (monto) => {
    const numero = Number(monto);
    if (isNaN(numero) || numero === 0) return 'Consultar precio';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(numero);
  };

  return (
    <div style={{ backgroundColor: '#0d0d12', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px 20px', background: 'linear-gradient(180deg, #121214 0%, #0d0d12 100%)' }}>
        <h1 style={{ fontSize: '3.8rem', margin: '0 0 20px 0', fontWeight: '900', lineHeight: '1.2' }}>
          Tecnología <span style={{ color: '#00e5ff' }}>Premium</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#aaaaaa', maxWidth: '650px', margin: '0 auto 50px auto', lineHeight: '1.6' }}>
          Filtramos y seleccionamos el mejor hardware y accesorios del mercado para llevar tu setup al siguiente nivel.
        </p>
        <Link to="/productos">
          <button style={{ backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '15px 35px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}>
            EXPLORAR CATÁLOGO
          </button>
        </Link>
      </section>

      {/* CARRUSEL DINÁMICO (Conectado a Supabase) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0, borderLeft: '4px solid #00e5ff', paddingLeft: '15px' }}>Últimos Ingresos</h2>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => moverCarrusel('izq')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❮</button>
            <button onClick={() => moverCarrusel('der')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❯</button>
          </div>
        </div>

        <div ref={carruselRef} style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: '25px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Mapeamos los productos que trajimos de la base de datos */}
          {ofertas.map((producto) => (
            <div key={producto.id} className="tarjeta" style={{ minWidth: '260px', flexShrink: 0, border: '1px solid #4d4d5e' }}>
               <div className="contenedor-imagen" style={{ background: '#ffffff', width: '100%', height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={producto.imagen} alt={producto.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', marginTop: '15px' }}>
                 <h3 style={{ color: 'white', fontSize: '1.05rem', textAlign: 'center', margin: '0 0 10px 0' }}>{producto.titulo}</h3>
                 <p className="precio" style={{ color: '#00e5ff', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>{formatearMoneda(producto.precio)}</p>
                 <a href={producto.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                   <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #00e5ff', color: '#00e5ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
                     Ver Oferta
                   </button>
                 </a>
               </div>
            </div>
          ))}

          {/* Tarjeta Extra Fija: Ver todo */}
          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: '2px dashed #333' }}>
             <Link to="/productos" style={{ color: '#00e5ff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold', padding: '20px', textAlign: 'center' }}>Ver todo el catálogo +</Link>
          </div>
        </div>
      </section>

      {/* BLOQUES DE MARKETING */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 40px auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        <div style={{ background: '#1e1e24', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid #333' }}>
          <h3 style={{ color: '#00e5ff', fontSize: '1.4rem', marginBottom: '15px' }}>⚡ El Radar Definitivo</h3>
          <p style={{ color: '#aaaaaa' }}>Rastreamos las mejores oportunidades del mercado. Olvidate de comparar precios infinitamente, nosotros optimizamos tu tiempo.</p>
        </div>
        <div style={{ background: '#1e1e24', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid #333' }}>
          <h3 style={{ color: '#00e5ff', fontSize: '1.4rem', marginBottom: '15px' }}>🛡️ Enlaces Verificados</h3>
          <p style={{ color: '#aaaaaa' }}>Te redirigimos únicamente a tiendas oficiales y publicaciones comprobadas. Seguridad total en cada click que hagas.</p>
        </div>
        <div style={{ background: '#1e1e24', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid #333' }}>
          <h3 style={{ color: '#00e5ff', fontSize: '1.4rem', marginBottom: '15px' }}>💎 Selección Curada</h3>
          <p style={{ color: '#aaaaaa' }}>Descartamos el ruido. Solo vas a encontrar tecnología y accesorios que cumplen con los estándares de calidad más exigentes.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#121214', borderTop: '1px solid #333', padding: '50px 20px', textAlign: 'center', margin: '60px 0 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0, borderLeft: '4px solid #00e5ff', paddingLeft: '15px' }}>Últimos Ingresos</h2>
            <Link to="/ofertas-semana" style={{ color: '#00e5ff', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid #00e5ff', padding: '6px 15px', borderRadius: '20px', transition: 'all 0.3s', fontWeight: 'bold' }}>
              Ver últimos publicados +
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => moverCarrusel('izq')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❮</button>
            <button onClick={() => moverCarrusel('der')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❯</button>
          </div>
        </div>
        <p style={{ color: '#888', margin: '0 0 20px 0' }}>Innovación y rendimiento en un solo lugar.</p>
        <p style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '1.1rem' }}>@TecnoOne_A&H</p>
        <hr style={{ borderColor: '#333', margin: '30px auto', maxWidth: '800px' }} />
        <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>
          © {new Date().getFullYear()} A&H Tecno. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Vidriera;