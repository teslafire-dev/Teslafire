-- ====================================================================
-- TESLA FIRE ERP & POS - ESQUEMA INTEGRAL DE BASE DE DATOS SUPABASE
-- ====================================================================
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/yptwyaxocnobcrkfxrjc/sql
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUCURSALES / TIENDAS
CREATE TABLE IF NOT EXISTS tiendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    es_principal BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MONEDAS Y TASAS DE CAMBIO
CREATE TABLE IF NOT EXISTS monedas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    simbolo VARCHAR(5) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    es_base BOOLEAN DEFAULT FALSE,
    tasa_cambio NUMERIC(14, 4) NOT NULL DEFAULT 1.0000,
    activo BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial diario de tasas BCV
CREATE TABLE IF NOT EXISTS tasas_cambio (
    id BIGSERIAL PRIMARY KEY,
    moneda_codigo VARCHAR(10) NOT NULL DEFAULT 'USD',
    tasa NUMERIC(14, 4) NOT NULL,
    fuente VARCHAR(50) DEFAULT 'BCV',
    fecha_vigencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre_completo TEXT,
    rol TEXT DEFAULT 'cajero' CHECK (rol IN ('admin', 'gerente', 'cajero', 'almacenista', 'contador')),
    tienda_id UUID REFERENCES tiendas(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando un usuario se registra en Supabase Auth
-- El PRIMER usuario registrado en el sistema se convierte en 'admin' (Administrador Total) automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_count INT;
    default_role TEXT;
    tienda_defecto UUID;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.perfiles;
    SELECT id INTO tienda_defecto FROM public.tiendas WHERE es_principal = TRUE LIMIT 1;
    
    -- Si es el primer perfil, se asigna como 'admin', los demás usan el rol enviado o 'cajero'
    IF user_count = 0 THEN
        default_role := 'admin';
    ELSE
        default_role := COALESCE(new.raw_user_meta_data->>'rol', 'cajero');
    END IF;

    INSERT INTO public.perfiles (id, email, nombre_completo, rol, tienda_id, activo)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nombre_completo', split_part(new.email, '@', 1)),
        default_role,
        tienda_defecto,
        true
    )
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        nombre_completo = COALESCE(EXCLUDED.nombre_completo, perfiles.nombre_completo);
        
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

GRANT ALL ON TABLE public.perfiles TO postgres, anon, authenticated, service_role;


-- 4. CUENTAS BANCARIAS Y CAJAS
CREATE TABLE IF NOT EXISTS cuentas_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID REFERENCES tiendas(id),
    nombre_banco TEXT NOT NULL,
    numero_cuenta VARCHAR(30),
    tipo_cuenta VARCHAR(30) DEFAULT 'CORRIENTE',
    moneda_codigo VARCHAR(10) NOT NULL DEFAULT 'BS',
    saldo_actual NUMERIC(16, 2) DEFAULT 0.00,
    es_caja_chica BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORÍAS Y MARCAS
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    icono TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marcas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTOS Y SERVICIOS
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    codigo_barra TEXT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias(id),
    marca_id UUID REFERENCES marcas(id),
    tipo_precio TEXT CHECK (tipo_precio IN ('fijo', 'cotizacion')) DEFAULT 'fijo',
    precio NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    precio_mayor NUMERIC(14, 2),
    costo_promedio NUMERIC(14, 4) DEFAULT 0.00,
    aplica_iva BOOLEAN DEFAULT TRUE,
    es_servicio BOOLEAN DEFAULT FALSE,
    es_varios BOOLEAN DEFAULT FALSE,
    stock_minimo INTEGER DEFAULT 5,
    unidad_medida VARCHAR(20) DEFAULT 'UND',
    imagenes_urls TEXT[] DEFAULT '{}',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STOCK POR TIENDA / MULTI-SUCURSAL
CREATE TABLE IF NOT EXISTS producto_stock (
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
    stock_actual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_comprometido NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ubicacion VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (producto_id, tienda_id)
);

-- 8. CLIENTES Y BILLETERA A FAVOR
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento VARCHAR(30) UNIQUE NOT NULL, -- V-..., J-..., G-...
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    limite_credito NUMERIC(14, 2) DEFAULT 0.00,
    dias_credito INT DEFAULT 0,
    saldo_favor NUMERIC(14, 2) DEFAULT 0.00, -- Billetera digital por vuelto
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billetera_movimientos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('ABONO_VUELTO', 'USO_PAGO', 'AJUSTE')),
    monto_usd NUMERIC(14, 2) NOT NULL,
    referencia_doc TEXT,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VENTAS Y FACTURACIÓN
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID REFERENCES tiendas(id),
    cliente_id UUID REFERENCES clientes(id),
    usuario_id UUID REFERENCES auth.users(id),
    tipo_documento VARCHAR(30) NOT NULL, -- 'FACTURA FISCAL', 'NOTA DE ENTREGA', 'PRESUPUESTO'
    numero_factura TEXT,
    numero_control TEXT,
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'EMITIDA' CHECK (estado IN ('EMITIDA', 'ANULADA', 'PENDIENTE_PAGO')),
    condicion_pago VARCHAR(20) DEFAULT 'CONTADO' CHECK (condicion_pago IN ('CONTADO', 'CREDITO')),
    subtotal_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    iva_monto_usd NUMERIC(14, 2) DEFAULT 0.00,
    igtf_monto_usd NUMERIC(14, 2) DEFAULT 0.00,
    total_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tasa_bcv NUMERIC(14, 4) NOT NULL,
    total_bs NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
    saldo_pendiente_usd NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venta_items (
    id BIGSERIAL PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    sku TEXT,
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(12, 2) NOT NULL,
    precio_unitario NUMERIC(14, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL
);

-- 10. PAGOS Y VUELTOS MULTIMONEDA
CREATE TABLE IF NOT EXISTS venta_pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    metodo_pago VARCHAR(50) NOT NULL, -- 'EFECTIVO_USD', 'ZELLE', 'PAGO_MOVIL', 'TRANSFERENCIA', 'BILLETERA'
    moneda_codigo VARCHAR(10) NOT NULL,
    cuenta_bancaria_id UUID REFERENCES cuentas_bancarias(id),
    monto_moneda NUMERIC(16, 2) NOT NULL,
    tasa_cambio NUMERIC(14, 4) NOT NULL,
    monto_usd NUMERIC(14, 2) NOT NULL,
    referencia TEXT,
    comprobante_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venta_vueltos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL, -- 'EFECTIVO_USD', 'PAGO_MOVIL_BS', 'BILLETERA_CLIENTE'
    monto_usd NUMERIC(14, 2) NOT NULL,
    monto_moneda NUMERIC(16, 2),
    referencia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. KARDEX DE INVENTARIO
CREATE TABLE IF NOT EXISTS kardex_movimientos (
    id BIGSERIAL PRIMARY KEY,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    tienda_id UUID REFERENCES tiendas(id),
    tipo VARCHAR(30) NOT NULL, -- 'VENTA', 'COMPRA', 'TRASLADO_ENTRADA', 'TRASLADO_SALIDA', 'AJUSTE', 'CONSUMO_INTERNO'
    referencia_doc TEXT,
    cantidad NUMERIC(12, 2) NOT NULL,
    saldo_anterior NUMERIC(12, 2) NOT NULL,
    saldo_nuevo NUMERIC(12, 2) NOT NULL,
    costo_unitario NUMERIC(14, 4),
    usuario_id UUID REFERENCES auth.users(id),
    motivo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TURNOS DE CAJA (ARQUEO CIEGO)
CREATE TABLE IF NOT EXISTS turnos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID REFERENCES tiendas(id),
    usuario_id UUID REFERENCES auth.users(id),
    monto_inicial_usd NUMERIC(14, 2) DEFAULT 0.00,
    monto_inicial_bs NUMERIC(16, 2) DEFAULT 0.00,
    fecha_apertura TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO')),
    conteo_cajero_usd NUMERIC(14, 2),
    conteo_cajero_bs NUMERIC(16, 2),
    total_sistema_usd NUMERIC(14, 2),
    total_sistema_bs NUMERIC(16, 2),
    diferencia_usd NUMERIC(14, 2),
    diferencia_bs NUMERIC(16, 2),
    notas TEXT
);

-- 13. CONFIGURACIONES GENERALES Y CMS
CREATE TABLE IF NOT EXISTS configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    location VARCHAR(50) DEFAULT 'header',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ips_bloqueadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT UNIQUE NOT NULL,
    razon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actividad_usuarios (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    ip TEXT,
    user_agent TEXT,
    navegador TEXT,
    os TEXT,
    ruta TEXT,
    pais TEXT,
    ciudad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compatibilidad catálogo
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS precio_detal_bcv NUMERIC(14,2),
ADD COLUMN IF NOT EXISTS precio_credito NUMERIC(14,2),
ADD COLUMN IF NOT EXISTS tratamiento_iva VARCHAR(50) DEFAULT 'General — 16,00%',
ADD COLUMN IF NOT EXISTS peso_kg NUMERIC(10,3) DEFAULT 0.000,
ADD COLUMN IF NOT EXISTS dimensiones TEXT,
ADD COLUMN IF NOT EXISTS ubicacion_almacen TEXT,
ADD COLUMN IF NOT EXISTS clasificacion_origen VARCHAR(50) DEFAULT 'Fabricación Nacional',
ADD COLUMN IF NOT EXISTS unidades_por_caja INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS garantia_meses INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloquear_mayor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proveedor_nombre TEXT,
ADD COLUMN IF NOT EXISTS imagen_url TEXT;


CREATE TABLE IF NOT EXISTS producto_categorias (
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, categoria_id)
);

-- RLS para tablas complementarias
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE ips_bloqueadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública configuracion" ON configuracion;
CREATE POLICY "Lectura pública configuracion" ON configuracion FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública menus" ON menus;
CREATE POLICY "Lectura pública menus" ON menus FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública ips_bloqueadas" ON ips_bloqueadas;
CREATE POLICY "Lectura pública ips_bloqueadas" ON ips_bloqueadas FOR ALL USING (true);

DROP POLICY IF EXISTS "Insertar actividad_usuarios" ON actividad_usuarios;
CREATE POLICY "Insertar actividad_usuarios" ON actividad_usuarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura actividad_usuarios" ON actividad_usuarios;
CREATE POLICY "Lectura actividad_usuarios" ON actividad_usuarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública producto_categorias" ON producto_categorias;
CREATE POLICY "Lectura pública producto_categorias" ON producto_categorias FOR ALL USING (true);

-- ====================================================================
-- DATOS INICIALES (SEEDS OBLIGATORIOS)
-- ====================================================================

-- Sede Principal
INSERT INTO tiendas (nombre, codigo, direccion, telefono, es_principal)
VALUES ('Tesla Fire - Sede Principal', 'TF-01', 'Av. Industrial, Galpón 4, Valencia, Carabobo', '+58 241-888-9900', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Monedas
INSERT INTO monedas (codigo, simbolo, nombre, es_base, tasa_cambio) VALUES
('USD', '$', 'Dólar Estadounidense', TRUE, 1.0000),
('BS', 'Bs.', 'Bolívar Digital', FALSE, 804.8100)
ON CONFLICT (codigo) DO UPDATE SET tasa_cambio = EXCLUDED.tasa_cambio;

-- Tasa BCV inicial
INSERT INTO tasas_cambio (moneda_codigo, tasa, fuente, fecha_vigencia)
VALUES ('USD', 804.81, 'BCV', CURRENT_DATE);

-- Configuraciones iniciales
INSERT INTO configuracion (clave, valor) VALUES 
('markup_bcv_usd', '0'),
('markup_bcv_eur', '0'),
('max_concurrent_visitors', '100')
ON CONFLICT (clave) DO NOTHING;

-- Cliente por defecto para ventas rápidas de mostrador
INSERT INTO clientes (documento, nombre, direccion, telefono, email, limite_credito, saldo_favor)
VALUES ('V-00000000', 'Clientes Varios / Consumidor Final', 'Ventas de Mostrador', '+58 000-0000000', 'mostrador@teslafire.com', 0.00, 0.00)
ON CONFLICT (documento) DO NOTHING;

-- Categorías Industriales Tesla Fire
INSERT INTO categorias (nombre, slug, descripcion, icono, orden) VALUES
('Extintores y Cilindros', 'extintores', 'Extintores PQS, CO2, Solkaflam y sistemas fijos', 'Flame', 1),
('Equipos de Protección Personal', 'epp', 'Cascos, guantes de nitrilo, botas dieléctricas y lentes', 'Shield', 2),
('Detección y Alarmas', 'alarmas', 'Detectores de humo, sensores fotoeléctricos y sirenas con estrobo', 'Bell', 3),
('Mangueras y Válvulas', 'hidrantes', 'Sistemas de gabinetes contra incendio y bifurcadoras', 'Droplet', 4),
('Señalética de Seguridad', 'senaletica', 'Fotoluminiscentes bajo normas COVENIN', 'AlertTriangle', 5)
ON CONFLICT (nombre) DO NOTHING;

-- Productos Iniciales de Demostración y Facturación Inmediata
DO $$
DECLARE
    tienda_uuid UUID;
    cat_extintores UUID;
    cat_epp UUID;
    cat_alarmas UUID;
    p1 UUID;
    p2 UUID;
    p3 UUID;
    p4 UUID;
BEGIN
    SELECT id INTO tienda_uuid FROM tiendas WHERE codigo = 'TF-01' LIMIT 1;
    SELECT id INTO cat_extintores FROM categorias WHERE slug = 'extintores' LIMIT 1;
    SELECT id INTO cat_epp FROM categorias WHERE slug = 'epp' LIMIT 1;
    SELECT id INTO cat_alarmas FROM categorias WHERE slug = 'alarmas' LIMIT 1;

    -- P1: Extintor PQS 10 Lbs
    INSERT INTO productos (sku, codigo_barra, nombre, descripcion, categoria_id, precio, precio_mayor, costo_promedio, aplica_iva, stock_minimo)
    VALUES ('EXT-PQS-10', '759100100101', 'Extintor PQS 10 Lbs ABC Amerex', 'Cilindro con manómetro certificado COVENIN', cat_extintores, 45.00, 39.00, 25.00, TRUE, 10)
    ON CONFLICT (sku) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO p1;

    -- P2: Detector de Humo Óptico
    INSERT INTO productos (sku, codigo_barra, nombre, descripcion, categoria_id, precio, precio_mayor, costo_promedio, aplica_iva, stock_minimo)
    VALUES ('DET-OPT-01', '759100100102', 'Detector de Humo Fotoeléctrico 24V', 'Sensor con luz indicadora LED 360 y base estándar', cat_alarmas, 28.50, 24.00, 14.20, TRUE, 15)
    ON CONFLICT (sku) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO p2;

    -- P3: Casco Dieléctrico con Barbuquejo
    INSERT INTO productos (sku, codigo_barra, nombre, descripcion, categoria_id, precio, precio_mayor, costo_promedio, aplica_iva, stock_minimo)
    VALUES ('EPP-CAS-01', '759100100103', 'Casco Dieléctrico Tipo II ANSI Z89', 'Suspensión de 6 puntos tipo rachet regulable', cat_epp, 14.00, 11.50, 7.10, TRUE, 20)
    ON CONFLICT (sku) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO p3;

    -- P4: Botas de Seguridad Punta de Acero
    INSERT INTO productos (sku, codigo_barra, nombre, descripcion, categoria_id, precio, precio_mayor, costo_promedio, aplica_iva, stock_minimo)
    VALUES ('EPP-BOT-42', '759100100104', 'Bota de Seguridad Cuero Hidrofugado Talla 42', 'Suela de poliuretano doble densidad resistente a hidrocarburos', cat_epp, 38.00, 32.00, 20.00, TRUE, 8)
    ON CONFLICT (sku) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO p4;

    -- Asignar stock en Tienda Principal
    IF p1 IS NOT NULL THEN
        INSERT INTO producto_stock (producto_id, tienda_id, stock_actual, ubicacion)
        VALUES (p1, tienda_uuid, 85.00, 'Pasillo A - Estante 1')
        ON CONFLICT (producto_id, tienda_id) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;
    END IF;

    IF p2 IS NOT NULL THEN
        INSERT INTO producto_stock (producto_id, tienda_id, stock_actual, ubicacion)
        VALUES (p2, tienda_uuid, 42.00, 'Pasillo B - Gabinete 3')
        ON CONFLICT (producto_id, tienda_id) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;
    END IF;

    IF p3 IS NOT NULL THEN
        INSERT INTO producto_stock (producto_id, tienda_id, stock_actual, ubicacion)
        VALUES (p3, tienda_uuid, 120.00, 'Almacén EPP - Anaquel 2')
        ON CONFLICT (producto_id, tienda_id) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;
    END IF;

    IF p4 IS NOT NULL THEN
        INSERT INTO producto_stock (producto_id, tienda_id, stock_actual, ubicacion)
        VALUES (p4, tienda_uuid, 35.00, 'Almacén Calzado - Nivel 1')
        ON CONFLICT (producto_id, tienda_id) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;
    END IF;

END $$;

-- ====================================================================
-- POLÍTICAS DE ACCESO RLS (SEGURIDAD ROW LEVEL SECURITY)
-- ====================================================================

ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE monedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasas_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE billetera_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_vueltos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kardex_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos_caja ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso RLS (100% Idempotentes con DROP previo)
DROP POLICY IF EXISTS "Lectura pública de tiendas" ON tiendas;
CREATE POLICY "Lectura pública de tiendas" ON tiendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de monedas" ON monedas;
CREATE POLICY "Lectura pública de monedas" ON monedas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de tasas" ON tasas_cambio;
CREATE POLICY "Lectura pública de tasas" ON tasas_cambio FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de categorias" ON categorias;
CREATE POLICY "Lectura pública de categorias" ON categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de marcas" ON marcas;
CREATE POLICY "Lectura pública de marcas" ON marcas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de productos" ON productos;
CREATE POLICY "Lectura pública de productos" ON productos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de stock" ON producto_stock;
CREATE POLICY "Lectura pública de stock" ON producto_stock FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura de clientes" ON clientes;
CREATE POLICY "Lectura de clientes" ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertar clientes" ON clientes;
CREATE POLICY "Insertar clientes" ON clientes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizar clientes" ON clientes;
CREATE POLICY "Actualizar clientes" ON clientes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Registrar ventas" ON ventas;
CREATE POLICY "Registrar ventas" ON ventas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura de ventas" ON ventas;
CREATE POLICY "Lectura de ventas" ON ventas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Items de venta" ON venta_items;
CREATE POLICY "Items de venta" ON venta_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Pagos de venta" ON venta_pagos;
CREATE POLICY "Pagos de venta" ON venta_pagos FOR ALL USING (true);

DROP POLICY IF EXISTS "Vueltos de venta" ON venta_vueltos;
CREATE POLICY "Vueltos de venta" ON venta_vueltos FOR ALL USING (true);

DROP POLICY IF EXISTS "Turnos de caja" ON turnos_caja;
CREATE POLICY "Turnos de caja" ON turnos_caja FOR ALL USING (true);

DROP POLICY IF EXISTS "Kardex movimientos" ON kardex_movimientos;
CREATE POLICY "Kardex movimientos" ON kardex_movimientos FOR ALL USING (true);

DROP POLICY IF EXISTS "Cuentas bancarias" ON cuentas_bancarias;
CREATE POLICY "Cuentas bancarias" ON cuentas_bancarias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de perfiles" ON perfiles;
CREATE POLICY "Lectura pública de perfiles" ON perfiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Actualizar perfiles" ON perfiles;
CREATE POLICY "Actualizar perfiles" ON perfiles FOR UPDATE USING (true);

-- Políticas de escritura para inventario y catálogo
DROP POLICY IF EXISTS "Gestionar productos" ON productos;
CREATE POLICY "Gestionar productos" ON productos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar categorias" ON categorias;
CREATE POLICY "Gestionar categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar marcas" ON marcas;
CREATE POLICY "Gestionar marcas" ON marcas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar stock" ON producto_stock;
CREATE POLICY "Gestionar stock" ON producto_stock FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- CAMPOS EXTENDIDOS TESLA FIRE PARA PRODUCTOS
-- (Ejecutar en el SQL Editor de Supabase)
-- ====================================================================
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_detal_bcv NUMERIC(14, 2);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_credito NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tratamiento_iva TEXT DEFAULT 'General — 16,00%';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS peso_kg NUMERIC(10, 3) DEFAULT 0.000;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS dimensiones TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS ubicacion_almacen TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS clasificacion_origen TEXT DEFAULT 'Fabricación Nacional';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidades_por_caja INTEGER DEFAULT 1;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS garantia_meses INTEGER DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS bloquear_mayor BOOLEAN DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS proveedor_nombre TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- ====================================================================
-- CATEGORÍAS Y MARCAS OFICIALES TESLA FIRE
-- ====================================================================
INSERT INTO categorias (nombre, slug, descripcion) VALUES
('Extintores PQS', 'extintores-pqs', 'Extintores de Polvo Químico Seco ABC/BC'),
('Extintores CO2', 'extintores-co2', 'Extintores de Dióxido de Carbono'),
('Extintores Especiales', 'extintores-especiales', 'Extintores Clase K, Acetato de Potasio, Agua Presurizada'),
('Repuestos y Accesorios', 'repuestos-accesorios', 'Válvulas, manómetros, mangueras, soportes y precintos'),
('Detección y Alarma', 'deteccion-alarma', 'Sensores de humo, térmicos, estaciones manuales, paneles'),
('Señalización y Seguridad', 'senalizacion-seguridad', 'Señales fotoluminiscentes, botiquines, EPP'),
('Servicios', 'servicios', 'Recargas, mantenimiento, inspección técnica y pruebas hidrostáticas')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO marcas (nombre) VALUES
('Tesla Fire'),
('Amerex'),
('Kidde'),
('Ansul'),
('Buckeye'),
('Badger'),
('Bosch'),
('Genérico')
ON CONFLICT (nombre) DO NOTHING;

-- ====================================================================
-- SOLICITUDES DE TRASLADO ENTRE TIENDAS Y ALMACENES
-- ====================================================================
CREATE TABLE IF NOT EXISTS solicitudes_traslado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) UNIQUE NOT NULL,
    origen_tienda_id UUID REFERENCES tiendas(id),
    origen_nombre TEXT,
    destino_tienda_id UUID REFERENCES tiendas(id),
    destino_nombre TEXT,
    estado VARCHAR(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En tránsito', 'Recibida', 'Cancelada')),
    items_count INTEGER DEFAULT 0,
    notas TEXT,
    solicitado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitud_traslado_items (
    id BIGSERIAL PRIMARY KEY,
    solicitud_id UUID REFERENCES solicitudes_traslado(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    sku TEXT,
    nombre TEXT,
    cantidad NUMERIC(12, 2) NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE solicitudes_traslado ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_traslado_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar solicitudes_traslado" ON solicitudes_traslado;
CREATE POLICY "Gestionar solicitudes_traslado" ON solicitudes_traslado FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar solicitud_traslado_items" ON solicitud_traslado_items;
CREATE POLICY "Gestionar solicitud_traslado_items" ON solicitud_traslado_items FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- MOVIMIENTOS HISTÓRICOS DE TRASLADO ENTRE ALMACENES
-- ====================================================================
CREATE TABLE IF NOT EXISTS traslados_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) UNIQUE NOT NULL,
    producto_id UUID REFERENCES productos(id),
    producto_nombre TEXT,
    producto_sku TEXT,
    origen_tienda_id UUID REFERENCES tiendas(id),
    origen_nombre TEXT,
    destino_tienda_id UUID REFERENCES tiendas(id),
    destino_nombre TEXT,
    cantidad NUMERIC(12, 2) NOT NULL,
    usuario_nombre TEXT DEFAULT 'Admin',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE traslados_movimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar traslados_movimientos" ON traslados_movimientos;
CREATE POLICY "Gestionar traslados_movimientos" ON traslados_movimientos FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- CONSUMOS INTERNOS (SALIDAS OPERATIVAS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS consumos_internos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) UNIQUE NOT NULL,
    producto_id UUID REFERENCES productos(id),
    producto_nombre TEXT,
    producto_sku TEXT,
    tienda_id UUID REFERENCES tiendas(id),
    tienda_nombre TEXT,
    cantidad NUMERIC(12, 2) NOT NULL,
    motivo TEXT NOT NULL,
    notas TEXT,
    usuario_nombre TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consumos_internos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar consumos_internos" ON consumos_internos;
CREATE POLICY "Gestionar consumos_internos" ON consumos_internos FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- AUDITORÍAS FÍSICAS DE INVENTARIO
-- ====================================================================
CREATE TABLE IF NOT EXISTS auditorias_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) UNIQUE NOT NULL,
    nombre_sesion TEXT,
    tienda_id UUID REFERENCES tiendas(id),
    tienda_nombre TEXT,
    total_items INT DEFAULT 0,
    total_deficit NUMERIC(12, 2) DEFAULT 0,
    total_exceso NUMERIC(12, 2) DEFAULT 0,
    neto NUMERIC(12, 2) DEFAULT 0,
    estado VARCHAR(30) DEFAULT 'Completada',
    usuario_nombre TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria_items (
    id BIGSERIAL PRIMARY KEY,
    auditoria_id UUID REFERENCES auditorias_inventario(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    producto_sku TEXT,
    producto_nombre TEXT,
    stock_sistema NUMERIC(12, 2) NOT NULL,
    conteo_fisico NUMERIC(12, 2) NOT NULL,
    diferencia NUMERIC(12, 2) NOT NULL
);

ALTER TABLE auditorias_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar auditorias_inventario" ON auditorias_inventario;
CREATE POLICY "Gestionar auditorias_inventario" ON auditorias_inventario FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar auditoria_items" ON auditoria_items;
CREATE POLICY "Gestionar auditoria_items" ON auditoria_items FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- AJUSTES DE INVENTARIO
-- ====================================================================
CREATE TABLE IF NOT EXISTS ajustes_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) UNIQUE NOT NULL,
    tienda_id UUID REFERENCES tiendas(id),
    tienda_nombre TEXT,
    tipo VARCHAR(20) DEFAULT 'Entrada',
    motivo TEXT NOT NULL,
    items_count INT DEFAULT 0,
    neto NUMERIC(12, 2) DEFAULT 0,
    aplicado_por TEXT DEFAULT 'Admin',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ajustes_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar ajustes_inventario" ON ajustes_inventario;
CREATE POLICY "Gestionar ajustes_inventario" ON ajustes_inventario FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- MOVIMIENTOS GENERALES DE INVENTARIO (ENTRADAS Y SALIDAS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(30) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Entrada', 'Salida')),
    motivo TEXT NOT NULL,
    producto_id UUID REFERENCES productos(id),
    producto_nombre TEXT NOT NULL,
    producto_sku TEXT NOT NULL,
    tienda_id UUID REFERENCES tiendas(id),
    tienda_nombre TEXT NOT NULL,
    cantidad NUMERIC(12, 2) NOT NULL,
    usuario_nombre TEXT DEFAULT 'Gerencia',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar movimientos_inventario" ON movimientos_inventario;
CREATE POLICY "Gestionar movimientos_inventario" ON movimientos_inventario FOR ALL USING (true) WITH CHECK (true);

-- 15. EXTENSIÓN CLIENTES (DATOS VENEZUELA, JURÍDICOS Y CRÉDITO)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS canal_venta VARCHAR(50) DEFAULT 'Detal';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado VARCHAR(50);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ciudad VARCHAR(50);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS categoria_cliente VARCHAR(30) DEFAULT 'REGULAR';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT FALSE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rif_empresa VARCHAR(30);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cedula_rif_socio VARCHAR(30);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS registro_mercantil_nro VARCHAR(100);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS registro_mercantil_url TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto_socio TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto_1 JSONB DEFAULT '{}'::jsonb;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto_2 JSONB DEFAULT '{}'::jsonb;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS referencias_proveedores JSONB DEFAULT '[]'::jsonb;

-- 16. COTIZACIONES Y PRESUPUESTOS
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(30) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    cliente_nombre TEXT NOT NULL,
    cliente_documento VARCHAR(30),
    cliente_telefono VARCHAR(50),
    vendedor_nombre TEXT DEFAULT 'Mostrador',
    tienda_id UUID REFERENCES tiendas(id),
    subtotal NUMERIC(14, 2) DEFAULT 0.00,
    iva NUMERIC(14, 2) DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) DEFAULT 'Vigente',
    documento_convertido TEXT,
    fecha_validez DATE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    producto_nombre TEXT NOT NULL,
    producto_sku TEXT NOT NULL,
    cantidad NUMERIC(12, 2) NOT NULL,
    precio_unitario NUMERIC(14, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL
);

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar cotizaciones" ON cotizaciones;
CREATE POLICY "Gestionar cotizaciones" ON cotizaciones FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar cotizacion_items" ON cotizacion_items;
CREATE POLICY "Gestionar cotizacion_items" ON cotizacion_items FOR ALL USING (true) WITH CHECK (true);

-- 17. NOTAS DE ENTREGA Y DESPACHO
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado_despacho VARCHAR(30) DEFAULT 'Despachado';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- 18. MOVIMIENTOS DE CAJA (INGRESOS Y EGRESOS MANUALES)
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turno_id UUID REFERENCES turnos_caja(id),
    tienda_id UUID REFERENCES tiendas(id),
    usuario_nombre TEXT DEFAULT 'Administrador',
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    instrumento VARCHAR(30) NOT NULL,
    monto NUMERIC(14, 2) NOT NULL,
    concepto TEXT NOT NULL,
    tipo_caja VARCHAR(30) DEFAULT 'Factura Fiscal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. DEVOLUCIONES Y NOTAS DE CRÉDITO
CREATE TABLE IF NOT EXISTS devoluciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_nota_credito VARCHAR(30) UNIQUE NOT NULL,
    factura_numero VARCHAR(30) NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_documento VARCHAR(30),
    items_count INT DEFAULT 1,
    tipo_reembolso VARCHAR(30) DEFAULT 'Efectivo',
    total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    usuario_nombre TEXT DEFAULT 'Administrador',
    motivo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar movimientos_caja" ON movimientos_caja;
CREATE POLICY "Gestionar movimientos_caja" ON movimientos_caja FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gestionar devoluciones" ON devoluciones;
CREATE POLICY "Gestionar devoluciones" ON devoluciones FOR ALL USING (true) WITH CHECK (true);

