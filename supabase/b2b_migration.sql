-- ====================================================================
-- TESLA FIRE ERP & POS - MIGRACIÓN MÓDULO B2B (EMPRESAS / MAYORISTAS)
-- ====================================================================
-- Ejecutar en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Actualizar check de roles en 'perfiles' para incluir 'cliente_b2b'
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_rol_check;
ALTER TABLE perfiles ADD CONSTRAINT perfiles_rol_check 
  CHECK (rol IN ('admin', 'gerente', 'cajero', 'almacenista', 'contador', 'editor', 'invitado', 'cliente_b2b'));

-- 2. Vincular tabla clientes con auth.users
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado_aprobacion VARCHAR(20) DEFAULT 'APROBADO' CHECK (estado_aprobacion IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'));
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);

-- 3. Crear tabla pedidos_b2b (Solicitudes de pedidos/cotizaciones B2B)
CREATE TABLE IF NOT EXISTS pedidos_b2b (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(30) UNIQUE NOT NULL, -- Ej: PED-B2B-000001
    cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_documento VARCHAR(30) NOT NULL, -- J-..., V-...
    cliente_telefono VARCHAR(50),
    cliente_email VARCHAR(100),
    cliente_direccion TEXT,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO_COTIZACION', 'APROBADO_FACTURA', 'RECHAZADO')),
    condicion_pago VARCHAR(20) DEFAULT 'CREDITO' CHECK (condicion_pago IN ('CONTADO', 'CREDITO')),
    subtotal_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    iva_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tasa_bcv NUMERIC(14, 4) NOT NULL DEFAULT 36.50,
    total_bs NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
    notas TEXT,
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
    venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL,
    creado_por TEXT DEFAULT 'CLIENTE_PORTAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de items de pedidos_b2b
CREATE TABLE IF NOT EXISTS pedido_b2b_items (
    id BIGSERIAL PRIMARY KEY,
    pedido_id UUID REFERENCES pedidos_b2b(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
    sku TEXT,
    nombre TEXT NOT NULL,
    cantidad NUMERIC(12, 2) NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedido_b2b_items_pedido_id ON pedido_b2b_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_b2b_cliente_id ON pedidos_b2b(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_b2b_estado ON pedidos_b2b(estado);

-- 5. Función y trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pedidos_b2b_updated_at ON pedidos_b2b;
CREATE TRIGGER trg_pedidos_b2b_updated_at
  BEFORE UPDATE ON pedidos_b2b
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 6. Políticas de RLS para seguridad B2B
ALTER TABLE pedidos_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_b2b_items ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos_b2b:
-- Administradores/Personal pueden ver y modificar todo
DROP POLICY IF EXISTS "Staff total access pedidos_b2b" ON pedidos_b2b;
CREATE POLICY "Staff total access pedidos_b2b"
  ON pedidos_b2b FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE perfiles.id = auth.uid() 
      AND perfiles.rol IN ('admin', 'gerente', 'cajero', 'almacenista', 'contador', 'editor')
    )
  );

-- Clientes B2B pueden ver y crear sus propios pedidos
DROP POLICY IF EXISTS "Clientes B2B own pedidos_b2b" ON pedidos_b2b;
CREATE POLICY "Clientes B2B own pedidos_b2b"
  ON pedidos_b2b FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
  );

-- Políticas para pedido_b2b_items
DROP POLICY IF EXISTS "Staff total access pedido_b2b_items" ON pedido_b2b_items;
CREATE POLICY "Staff total access pedido_b2b_items"
  ON pedido_b2b_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE perfiles.id = auth.uid() 
      AND perfiles.rol IN ('admin', 'gerente', 'cajero', 'almacenista', 'contador', 'editor')
    )
  );

DROP POLICY IF EXISTS "Clientes B2B own pedido_b2b_items" ON pedido_b2b_items;
CREATE POLICY "Clientes B2B own pedido_b2b_items"
  ON pedido_b2b_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pedidos_b2b 
      WHERE pedidos_b2b.id = pedido_b2b_items.pedido_id 
      AND (
        pedidos_b2b.user_id = auth.uid() 
        OR pedidos_b2b.cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos_b2b 
      WHERE pedidos_b2b.id = pedido_b2b_items.pedido_id 
      AND (
        pedidos_b2b.user_id = auth.uid() 
        OR pedidos_b2b.cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
      )
    )
  );
