import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { siteConfig } from './siteConfig'

const legalSections = [
  {
    id: 'terminos',
    number: '01',
    title: 'Términos y condiciones de uso',
    summary: 'Qué hace AH Tecno y qué ocurre cuando abrís una oferta.',
    content: (
      <>
        <h3>Alcance del servicio</h3>
        <p>
          AH Tecno es un catálogo tecnológico independiente que selecciona, organiza y presenta
          publicaciones de terceros. No somos el vendedor, fabricante, importador, medio de pago
          ni operador logístico de los productos mostrados.
        </p>

        <h3>Compras en sitios de terceros</h3>
        <p>
          La compra se inicia y completa en Mercado Libre o en la tienda indicada. Antes de
          comprar, revisá allí la identidad y reputación del vendedor, el precio final, el stock,
          el envío, la garantía, los cambios y las devoluciones. Esas condiciones corresponden a
          la plataforma y al vendedor que participa en la operación.
        </p>

        <h3>Información, precios y disponibilidad</h3>
        <p>
          Los datos pueden provenir de la publicación, de integraciones autorizadas o de una
          carga manual identificada. Aunque procuramos mantenerlos actualizados, pueden existir
          demoras, cambios o errores. Siempre prevalece la información vigente que veas en el
          sitio de destino antes de confirmar la compra.
        </p>

        <h3>Uso permitido</h3>
        <p>
          Podés navegar y compartir el catálogo para fines personales y lícitos. No está
          permitido intentar vulnerar la seguridad, alterar el funcionamiento, automatizar
          clics, manipular estadísticas o reutilizar masivamente el contenido sin autorización.
        </p>

        <h3>Correcciones y derechos</h3>
        <p>
          Podemos corregir, actualizar, ocultar o retirar publicaciones que estén vencidas,
          resulten inexactas o dejen de ser adecuadas para el catálogo. Nada de lo expresado en
          estos términos limita los derechos obligatorios que correspondan conforme a la
          legislación argentina.
        </p>
      </>
    ),
  },
  {
    id: 'privacidad',
    number: '02',
    title: 'Política de privacidad',
    summary: 'Qué datos usamos en la parte pública y en el panel privado.',
    content: (
      <>
        <h3>Visitantes públicos</h3>
        <p>
          No necesitás crear una cuenta ni informar tu nombre o correo para explorar el catálogo.
          Nuestra medición propia registra el producto, el tipo de acción —por ejemplo, abrir un
          detalle, guardar un favorito, compartir o ir a Mercado Libre—, la ubicación del botón,
          el canal general de procedencia cuando está disponible y el momento. Esa medición no
          agrega tu correo, una cuenta de usuario ni tu dirección IP a nuestra tabla de actividad.
        </p>
        <p>
          También usamos Vercel Analytics para conocer visitas y rendimiento de manera agregada.
          Su medición está configurada sin cookies publicitarias ni perfiles destinados a
          publicidad personalizada. Los proveedores de infraestructura pueden procesar datos
          técnicos indispensables para entregar y proteger el sitio, según sus propias
          condiciones.
        </p>

        <h3>Administradores</h3>
        <p>
          El panel privado sí utiliza el correo de los administradores autorizados, una sesión de
          acceso y las credenciales necesarias para conectar servicios. Las credenciales de
          Mercado Libre se almacenan cifradas y no se muestran al público.
        </p>

        <h3>Finalidades, conservación y proveedores</h3>
        <p>
          Usamos los datos únicamente para operar y proteger la web, mantener el catálogo,
          autenticar administradores y entender qué productos resultan útiles. Conservamos los
          registros mientras sean necesarios para esas finalidades y revisamos periódicamente su
          utilidad. Vercel, Supabase y Mercado Libre pueden procesar información desde otras
          jurisdicciones conforme a sus contratos y políticas.
        </p>

        <h3>Tus consultas y derechos</h3>
        <p>
          Podés solicitar información, corrección o eliminación cuando corresponda. Para hacerlo,
          usá los canales indicados en <Link to="/legal#contacto">Contacto legal y privacidad</Link>.
          No envíes contraseñas, códigos de acceso ni datos financieros por redes sociales.
        </p>

        <div className="legal-callout">
          Actualmente no ofrecemos cuentas para visitantes, formularios públicos, newsletter ni
          publicidad personalizada.
        </div>
      </>
    ),
  },
  {
    id: 'afiliados',
    number: '03',
    title: 'Política de afiliados',
    summary: 'Cómo podemos recibir una comisión y qué no cambia para vos.',
    content: (
      <>
        <p>
          Algunos botones contienen enlaces de afiliados. Si realizás una compra después de usar
          uno de esos enlaces, AH Tecno puede recibir una comisión de la plataforma, sin agregar
          un costo extra al precio que pagás.
        </p>
        <p>
          La existencia de una comisión no convierte a AH Tecno en vendedor ni garantiza que una
          publicación sea la opción adecuada para todas las personas. La selección editorial,
          el orden y las categorías del catálogo son propios.
        </p>
        <p>
          No somos una tienda oficial ni afirmamos representar, estar certificados o contar con
          el respaldo comercial de Mercado Libre. El pago, la entrega, la garantía, las
          devoluciones y cualquier reclamo de la compra se gestionan con el vendedor y la
          plataforma de destino.
        </p>
        <p>
          El enlace de afiliado no modifica por sí mismo el precio del producto y puede dejar de
          funcionar si la publicación cambia o finaliza. Navegar por AH Tecno no implica ninguna
          obligación de compra.
        </p>
      </>
    ),
  },
  {
    id: 'almacenamiento',
    number: '04',
    title: 'Política de almacenamiento local',
    summary: 'Qué recuerda tu navegador y por qué no mostramos un banner invasivo.',
    content: (
      <>
        <h3>Preferencias del visitante</h3>
        <p>
          Guardamos en tu navegador la preferencia de tema claro u oscuro para que la web conserve
          tu elección. No usamos ese dato para identificarte ni para mostrar publicidad.
        </p>

        <h3>Cookies y medición</h3>
        <p>
          La parte pública no utiliza cookies publicitarias ni una aceptación general de cookies.
          Por eso no mostramos un cartel que te obligue a aceptar tecnologías que hoy no usamos.
          Las funciones de favoritos y vistos recientemente guardan en el almacenamiento local del
          dispositivo una referencia mínima de los productos elegidos o consultados. Esas listas no
          se envían a AH Tecno, Supabase ni Mercado Libre. Podemos registrar de manera separada y
          anónima que se utilizó el botón de favoritos para medir la utilidad de la función, pero no
          recibimos la lista privada guardada en el dispositivo. No requieren una cuenta y pueden
          eliminarse desde la propia web o borrando los datos del navegador.
        </p>

        <h3>Panel privado</h3>
        <p>
          El acceso administrativo y la autorización con Mercado Libre pueden requerir
          almacenamiento o cookies estrictamente necesarios para mantener una sesión segura y
          completar la conexión. No se utilizan para publicidad dirigida a visitantes.
        </p>

        <p>
          Podés borrar la información local desde la configuración de tu navegador. Al hacerlo,
          algunas preferencias, como el tema visual, volverán a su valor inicial.
        </p>
      </>
    ),
  },
  {
    id: 'contacto',
    number: '05',
    title: 'Contacto legal y privacidad',
    summary: 'Dónde informar un error, ejercer un derecho o hacer una consulta.',
    content: (
      <>
        <p>
          Para avisarnos sobre datos incorrectos, una posible vulneración de derechos, propiedad
          intelectual, seguridad o privacidad, podés escribirnos mediante la sección Comunidad o
          por cualquiera de los perfiles oficiales de AH Tecno.
        </p>

        <div className="legal-contact-actions">
          <Link className="button button--secondary" to="/comunidad">
            Ir a Comunidad
          </Link>
          {siteConfig.socialLinks.map((social) => (
            <a
              className="button button--secondary"
              href={social.url}
              key={social.id}
              target="_blank"
              rel="noreferrer"
            >
              {social.label}
            </a>
          ))}
        </div>

        <div className="legal-callout">
          No publiques ni envíes contraseñas, tokens, códigos de verificación, tarjetas u otros
          datos sensibles. Si tu consulta es sobre una compra, un envío o una devolución,
          gestionála directamente desde tu cuenta de Mercado Libre.
        </div>

        <p>
          Esta primera versión identifica públicamente al proyecto como AH Tecno y no expone los
          nombres personales de sus integrantes. Cuando se habilite un correo institucional
          específico, será incorporado en esta sección como canal oficial.
        </p>
      </>
    ),
  },
]

function Legal() {
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.slice(1)
    if (!id) return

    const target = document.getElementById(id)
    if (!(target instanceof HTMLDetailsElement)) return

    target.open = true
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  return (
    <main className="content-page legal-page">
      <header className="page-heading">
        <p className="eyebrow">Información legal</p>
        <h1>Transparencia, sin letra chica</h1>
        <p>
          Un resumen fácil de leer sobre cómo funciona AH Tecno. Abrí solamente la sección que
          necesites.
        </p>
      </header>

      <section className="legal-overview" aria-label="Resumen legal">
        <div>
          <span className="legal-overview__label">En pocas palabras</span>
          <p>
            Somos un catálogo independiente. Algunos enlaces pueden generar una comisión para AH
            Tecno, sin costo adicional para vos. La compra y sus condiciones se confirman en
            Mercado Libre.
          </p>
        </div>
        <span className="legal-overview__date">Actualizado: 27/07/2026</span>
      </section>

      <nav className="legal-quick-links" aria-label="Secciones legales">
        {legalSections.map((section) => (
          <a href={`#${section.id}`} key={section.id}>
            <span>{section.number}</span>
            {section.title}
          </a>
        ))}
      </nav>

      <div className="legal-sections">
        {legalSections.map((section) => (
          <details className="legal-section" id={section.id} key={section.id}>
            <summary>
              <span className="legal-section__number">{section.number}</span>
              <span className="legal-section__heading">
                <strong>{section.title}</strong>
                <small>{section.summary}</small>
              </span>
              <span className="legal-section__toggle" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="legal-section__body">{section.content}</div>
          </details>
        ))}
      </div>

      <p className="legal-note">
        Revisaremos esta información cuando cambien las funciones, integraciones o mecanismos de
        medición del sitio. La fecha visible arriba permite identificar la versión vigente.
      </p>
    </main>
  )
}

export default Legal
