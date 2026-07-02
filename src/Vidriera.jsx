import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

function Vidriera() {
  const carruselRef = useRef(null);

  const moverCarrusel = (direccion) => {
    if (carruselRef.current) {
      const distancia = 320;
      carruselRef.current.scrollBy({ left: direccion === 'izq' ? -distancia : distancia, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#0d0d12', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      
      {/* SECCIÓN 1: BIENVENIDA (Con mejor espaciado) */}
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

      {/* SECCIÓN 2: CARRUSEL CON PRODUCTOS REALES Y LINKS A MELI */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0, borderLeft: '4px solid #00e5ff', paddingLeft: '15px' }}>Últimos Ingresos</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => moverCarrusel('izq')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❮</button>
            <button onClick={() => moverCarrusel('der')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e1e24', border: '1px solid #333', color: '#00e5ff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>❯</button>
          </div>
        </div>

        <div ref={carruselRef} style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: '25px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Producto Real 1 */}
          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0 }}>
             <div className="contenedor-imagen" style={{ background: '#ffffff' }}>
                <img src="https://http2.mlstatic.com/D_NQ_NP_2X_702008-MLA74681607567_022024-F.webp" alt="Teclado" style={{ borderRadius: '4px' }} />
             </div>
             <h3 style={{ color: 'white', fontSize: '1.05rem', textAlign: 'center' }}>Teclado Wireless Redragon Eisa Pro K686wb</h3>
             <p className="precio" style={{ color: '#00e5ff', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}>$ 99.999</p>
             <a href="https://www.mercadolibre.com.ar/teclado-wireless-redragon-eisa-pro-k686wb-blanco-azul-rgb-n-blancoazul-espanol-latinoamerica/p/MLA53360613" target="_blank" rel="noopener noreferrer">
               <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #00e5ff', color: '#00e5ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Ver Oferta</button>
             </a>
          </div>

          {/* Producto Real 2 */}
          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0 }}>
             <div className="contenedor-imagen" style={{ background: '#ffffff' }}>
                <img src="https://http2.mlstatic.com/D_NQ_NP_2X_656209-MLU74384666016_022024-F.webp" alt="Power Bank" style={{ borderRadius: '4px' }} />
             </div>
             <h3 style={{ color: 'white', fontSize: '1.05rem', textAlign: 'center' }}>Xiaomi Power Bank 10000 (67w)</h3>
             <p className="precio" style={{ color: '#00e5ff', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}>$ 64.999</p>
             <a href="https://www.mercadolibre.com.ar/xiaomi-power-bank-10000-67w-con-cable-integrado-blanco-blanco/p/MLA66101767" target="_blank" rel="noopener noreferrer">
               <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #00e5ff', color: '#00e5ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Ver Oferta</button>
             </a>
          </div>

          {/* Producto Real 3 */}
          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0 }}>
             <div className="contenedor-imagen" style={{ background: '#ffffff' }}>
                <img src="https://http2.mlstatic.com/D_NQ_NP_2X_892224-MLA74681607567_022024-F.webp" alt="Proyector" style={{ borderRadius: '4px' }} />
             </div>
             <h3 style={{ color: 'white', fontSize: '1.05rem', textAlign: 'center' }}>Proyector Portátil 4K Hy300 Full Hd</h3>
             <p className="precio" style={{ color: '#00e5ff', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}>$ 69.900</p>
             <a href="https://www.mercadolibre.com.ar/proyector-portatil-4k-hy300-full-hd-wifi-hdmi-android-11-bt-50/p/MLA42238146" target="_blank" rel="noopener noreferrer">
               <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #00e5ff', color: '#00e5ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Ver Oferta</button>
             </a>
          </div>

          <div className="tarjeta" style={{ minWidth: '260px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: '2px dashed #333' }}>
             <Link to="/productos" style={{ color: '#00e5ff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold', padding: '20px' }}>Ver todo el catálogo +</Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: TEXTOS DE MARKETING PULIDOS */}
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
        <h2 style={{ color: '#00e5ff', fontSize: '1.8rem', margin: '0 0 10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <img src="/LogoAHTecno.png" alt="Icono" style={{ height: '25px' }} />
          A&H TECNO
        </h2>
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