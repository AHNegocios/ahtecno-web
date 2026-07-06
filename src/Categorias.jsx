// src/Categorias.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Categorias() {
  const listaCategorias = [
    { icon: '⌨️', title: 'Periféricos', desc: 'Teclados mecánicos, mouses de precisión, auriculares y alfombrillas para dominar cada partida.' },
    { icon: '⚙️', title: 'Componentes', desc: 'Procesadores, placas de video de última generación y motherboards.' },
    { icon: '🖥️', title: 'Equipos armados', desc: 'Computadoras de escritorio optimizadas para el más alto rendimiento.' },
    { icon: '🔋', title: 'Energía', desc: 'Power banks de carga rápida, adaptadores y cables reforzados para no quedarte sin batería.' },
    { icon: '🎥', title: 'Imagen y Video', desc: 'Proyectores 4K, monitores, cámaras web y accesorios de streaming para la mejor calidad.' },
    { icon: '🎵', title: 'Audio', desc: 'Parlantes bluetooth, barras de sonido y auriculares inalámbricos premium.' },
    { icon: '💾', title: 'Almacenamiento', desc: 'Discos sólidos SSD NVMe ultrarrápidos y unidades externas de gran capacidad.' },
    { icon: '🌐', title: 'Redes', desc: 'Routers de alta potencia, extensores de señal y placas de red de baja latencia.' },
    { icon: '📦', title: 'Varios', desc: 'Gadgets seleccionados y herramientas esenciales para terminar de armar tu setup.' }
  ];

  return (
    <div style={{ padding: '60px 20px', minHeight: '100vh', backgroundColor: 'var(--fondo-pagina)', transition: 'background-color 0.3s ease' }}>
      <h1 style={{ color: 'var(--texto-principal)', textAlign: 'center', fontSize: '2.8rem', margin: '0 0 10px 0', fontWeight: '900', transition: 'color 0.3s ease' }}>
        Nuestras <span style={{ color: 'var(--color-primario)' }}>Categorías</span>
      </h1>
      <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', marginBottom: '60px', fontSize: '1.15rem', transition: 'color 0.3s ease' }}>
        Navegá por nuestras secciones y encontrá exactamente lo que tu setup necesita.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '25px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {listaCategorias.map((cat, i) => (
          <Link to="/productos" key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', borderRadius: '12px', padding: '30px', textDecoration: 'none', transition: 'all 0.3s ease', minHeight: '140px' }}>
            <div style={{ fontSize: '3.8rem', marginRight: '20px', flexShrink: 0 }}>
              {cat.icon}
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: 'var(--color-primario)', margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{cat.title}</h2>
              <p style={{ color: 'var(--texto-secundario)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', transition: 'color 0.3s ease' }}>{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Categorias;