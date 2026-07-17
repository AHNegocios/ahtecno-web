function Legal() {
  return (
    <main className="content-page legal-page">
      <header className="page-heading">
        <p className="eyebrow">Información clara</p>
        <h1>Transparencia y privacidad</h1>
        <p>
          Queremos que sepas cómo funciona AH Tecno antes de abrir una oferta o realizar una
          compra.
        </p>
      </header>

      <div className="legal-grid">
        <section className="content-card">
          <h2>Enlaces de afiliados</h2>
          <p>
            Algunos enlaces pueden ser enlaces de afiliados. Si comprás desde ellos, AH Tecno
            puede recibir una comisión sin agregar un costo extra a tu compra.
          </p>
        </section>

        <section className="content-card">
          <h2>Precios y disponibilidad</h2>
          <p>
            Los precios, el stock, el envío y las condiciones pueden cambiar en el sitio de
            destino. La información válida al momento de comprar es la publicada por el vendedor.
          </p>
        </section>

        <section className="content-card">
          <h2>Compras en terceros</h2>
          <p>
            AH Tecno selecciona y organiza ofertas, pero no procesa pagos ni envíos. La operación
            se completa en Mercado Libre u otra tienda indicada en cada publicación.
          </p>
        </section>

        <section className="content-card">
          <h2>Datos de navegación</h2>
          <p>
            Actualmente no solicitamos datos personales para navegar el catálogo. Antes de
            incorporar analítica, cuentas o formularios, esta sección será actualizada.
          </p>
        </section>
      </div>

      <p className="legal-note">
        Esta página resume el funcionamiento actual del sitio y deberá revisarse antes de sumar
        nuevas integraciones o mecanismos de medición.
      </p>
    </main>
  )
}

export default Legal
