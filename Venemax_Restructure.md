# Reporte de Reestructuración y Actualización: Venemax Store

Este documento detalla el análisis de la página antigua, la migración/sembrado de la base de datos de Supabase con los nuevos productos de tecnología, las correcciones visuales en dispositivos móviles, y las guías de configuración para el administrador.

---

## 1. Análisis de la Estructura de la Página Antigua
Se analizó el archivo `pagina antigua/index.html` identificando las secciones clave de la tienda **Venemax Store**:
* **Hero/Inicio**: Título principal destacando "Venemax" y subtítulo: "Una marca sustentable inspirada en la tecnología".
* **Nosotros**: Descripción de distribución y servicios de computación, junto a la frase: *"La tecnología es mejor cuando reúne a la gente"*.
* **Servicios**: 4 bloques principales (Mantenimiento de Dispositivos, Soporte IT, Productos de calidad y Envíos nacionales).
* **Contadores**: Estadísticas globales (`50+` empresas, `1500+` equipos reparados, `12000+` vendidos, `500+` servicios).
* **Productos Destacados**: Impresora, Desktop, Laptop, Servidor.
* **Grid de Ofertas**: 6 tarjetas de productos enlazados a WhatsApp:
  1. Laptop Lenovo AMD E2-1800 ($ 269,99)
  2. Router Xiaomi 4C ($ 24,99)
  3. Router Mercurys 3 antenas ($ 19,99)
  4. Teclado + Mouse Banda Alámbrico ($ 9,99)
  5. Computador Dell Core I5 4ta Gen ($ 279)
  6. Computador HP Core I5 2da Gen ($ 239)
* **Contacto & Ubicación**: Teléfono corporativo, correo, Instagram, WhatsApp y mapa interactivo.

---

## 2. Actualización de Base de Datos (Supabase)

### Migración de Esquema
Se ejecutó un script de migración para incorporar las siguientes columnas a la tabla `productos` que estaban ausentes y provocaban fallos en las consultas del frontend:
* `is_new` (BOOLEAN DEFAULT FALSE)
* `is_offer` (BOOLEAN DEFAULT FALSE)

### Sembrado de Datos (Seeding)
Se desarrolló y ejecutó el script `seed_computadoras.cjs` que realizó las siguientes operaciones:
1. Limpieza de las tablas `productos`, `categorias`, `marcas` y `producto_categorias` para eliminar los datos anteriores de seguridad industrial.
2. Inserción de las marcas oficiales (`Lenovo`, `Xiaomi`, `Mercusys`, `Dell`, `HP`, `Banda`, `Venemax`).
3. Creación de las categorías de tecnología: `Laptops`, `Desktops`, `Redes`, `Accesorios`, `Impresoras`, `Servidores`.
4. Carga de los productos del catálogo de ofertas y carrusel de Venemax enlazados a sus respectivas marcas y categorías.

---

## 3. Optimizaciones en la Vista Móvil (`Carrito.tsx`)
Se corrigieron problemas visuales reportados en la URL de carrito en dispositivos móviles:
* **Botón de Confirmación**: Se redujo el espaciado de letras (`tracking-[0.1em]`) y se implementó un tamaño de fuente responsivo (`text-xs sm:text-sm`) con altura adaptativa (`min-h-[4.5rem] py-4 px-6`) para evitar que el texto desborde los márgenes en pantallas angostas.
* **Scroll Nativo**: Se limitó el scroll interno de los productos de la cesta a pantallas de escritorio (`lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)]`). En smartphones, los elementos fluyen de manera normal y natural con el desplazamiento general de la página.

---

## 4. Gestión Manual de la Tasa BCV
Para gestionar de forma manual la tasa de cambio global del Bolívar (Bs.) respecto al Dólar (USD) y Euro (EUR):
1. Inicie sesión en el **Panel de Administración** y diríjase a **Configuración** (`/admin/configuracion`).
2. Despliegue el módulo **Tasas y Monedas BCV**.
3. Edite los campos `MARKUP_BCV_USD` y `MARKUP_BCV_EUR` introduciendo el **monto total deseado por tasa** (el sistema calculará y guardará automáticamente el diferencial contra la tasa oficial del BCV).
4. Guarde el cambio pulsando el ícono de **Disquete**.
