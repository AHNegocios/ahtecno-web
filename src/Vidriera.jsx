// src/Vidriera.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Producto from './Producto';

function Vidriera() {
  const [ofertas, setOfertas] = useState([]);
  const carruselRef = useRef(null);

  useEffect(() => {
    async function fetchUltimosIngresos() {
      const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

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

  return (
    <div style={{ backgroundColor: 'var(--fondo-pagina)', minHeight: '100vh', color: 'var(--texto-principal)', overflowX: 'hidden', transition: 'background-color 0.3s ease, color 0.3s ease' }}>      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px 20px', backgroundColor: 'var(--fondo-pagina)', transition: 'background-color 0.3s ease' }}>        
        <h1 style={{ fontSize: '3.8rem', margin: '0 0 20px 0', fontWeight: '900', lineHeight: '1.2', color: 'var(--texto-principal)', transition: 'color 0.3s ease' }}>
          Tecnología <span style={{ color: 'var(--color-primario)' }}>Premium</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--texto-secundario)', maxWidth: '650px', margin: '0 auto 45px auto', lineHeight: '1.6', transition: 'color 0.3s ease' }}>
          Filtramos y seleccionamos el mejor hardware y accesorios del mercado para llevar tu setup al siguiente nivel.
        </p>
        <Link to="/productos">
          <button style={{ backgroundColor: 'var(--color-primario)', color: '#000', border: 'none', padding: '12px 25px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}>
            EXPLORAR CATÁLOGO
          </button>
        </Link>
      </section>

      {/* CARRUSEL DE PRODUCTOS CONECTADOS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ fontSize: '1.6rem', margin: 0, borderLeft: '4px solid #00e5ff', paddingLeft: '15px', color: 'var(--texto-principal)', fontWeight: 'bold', transition: 'color 0.3s ease' }}>
              Últimos Ingresos
            </h2>
            <Link to="/ofertas-semana" style={{ color: 'var(--color-primario)', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00e5ff', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Ver últimos publicados +
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => moverCarrusel('izq')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', color: 'var(--color-primario)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s ease' }}>❮</button>
            <button onClick={() => moverCarrusel('der')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', color: 'var(--color-primario)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s ease' }}>❯</button>
          </div>
        </div>

        {/* LLAMADO CORRECTO AL COMPONENTE */}
        <div ref={carruselRef} style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: '25px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {ofertas.map((producto) => (
            <Producto
              key={producto.id}
              titulo={producto.titulo}
              precio={producto.precio}
              linkOferta={producto.link}
              imagen={producto.imagen}
              ml_id={producto.ml_id}
              vista="grilla"
            />
          ))}
          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: '2px dashed var(--borde-tarjeta)', borderRadius: '12px', transition: 'border-color 0.3s ease' }}>
             <Link to="/productos" style={{ color: 'var(--color-primario)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 'bold', padding: '20px', textAlign: 'center' }}>Ver todo el catálogo +</Link>
          </div>
        </div>
      </section>

      {/* BLOQUES DE MARKETING */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 40px auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        <div style={{ background: 'var(--fondo-tarjeta)', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: 'var(--texto-principal)', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0, transition: 'color 0.3s ease' }}>⚡ El Radar Definitivo</h3>
          <p style={{ color: 'var(--texto-secundario)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', transition: 'color 0.3s ease' }}>Rastreamos las mejores oportunidades del mercado. Olvidate de comparar precios infinitamente, nosotros optimizamos tu tiempo.</p>
        </div>
        <div style={{ background: 'var(--fondo-tarjeta)', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: 'var(--texto-principal)', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0, transition: 'color 0.3s ease' }}>🛡️ Enlaces Verificados</h3>
          <p style={{ color: 'var(--texto-secundario)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', transition: 'color 0.3s ease' }}>Te redirigimos únicamente a tiendas oficiales y publicaciones comprobadas. Seguridad total en cada click que hagas.</p>
        </div>
        <div style={{ background: 'var(--fondo-tarjeta)', padding: '30px', borderRadius: '12px', flex: '1 1 300px', textAlign: 'center', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: 'var(--texto-principal)', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0, transition: 'color 0.3s ease' }}>💎 Selección Curada</h3>
          <p style={{ color: 'var(--texto-secundario)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', transition: 'color 0.3s ease' }}>Descartamos el ruido. Solo vas a encontrar tecnología y accesorios que cumplen con los estándares de calidad más exigentes.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--fondo-tarjeta)', borderTop: '1px solid var(--borde-tarjeta)', padding: '50px 20px', textAlign: 'center', margin: '60px 0 0 0', transition: 'all 0.3s ease' }}>
        <h2 style={{ color: 'var(--texto-principal)', fontSize: '1.6rem', margin: '0 0 10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'color 0.3s ease' }}>
          <img src="/LogoAHTecno.png" alt="Icono" style={{ height: '25px' }} />
          A&H TECNO
        </h2>
        <p style={{ color: 'var(--texto-secundario)', margin: '0 0 20px 0', fontSize: '0.95rem', transition: 'color 0.3s ease' }}>Innovación y rendimiento en un solo lugar.</p>
        <p style={{ color: 'var(--color-primario)', fontWeight: 'bold', fontSize: '1.05rem', margin: 0 }}>@TecnoOne_A&H</p>
        <hr style={{ borderColor: 'var(--borde-tarjeta)', margin: '25px auto', maxWidth: '800px', transition: 'border-color 0.3s ease' }} />
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.85rem', margin: 0, transition: 'color 0.3s ease' }}>
          © {new Date().getFullYear()} A&H Tecno. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Vidriera;