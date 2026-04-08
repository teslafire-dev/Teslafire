-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  imagen_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: marcas
CREATE TABLE marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  sitio_web TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id),
  marca_id UUID REFERENCES marcas(id),
  tipo_precio TEXT CHECK (tipo_precio IN ('cotizacion', 'fijo')) NOT NULL,
  precio NUMERIC(10,2) CHECK ((tipo_precio = 'fijo' AND precio > 0) OR (tipo_precio = 'cotizacion' AND precio IS NULL)),
  stock INTEGER DEFAULT 0,
  atributos JSONB DEFAULT '{}',
  imagenes_urls TEXT[] DEFAULT '{}',
  etiquetas TEXT[] DEFAULT '{}',
  destacado BOOLEAN DEFAULT FALSE,
  moneda TEXT DEFAULT 'USD',
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ordenes (reservas)
CREATE TABLE ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  localizador TEXT UNIQUE NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_cedula TEXT NOT NULL,
  mensaje TEXT,
  productos JSONB NOT NULL, -- [{sku, nombre, cantidad, precio_unitario}]
  total NUMERIC(10,2),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: configuracion (Global settings)
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: perfiles (User roles)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rol TEXT DEFAULT 'invitado' CHECK (rol IN ('admin', 'editor', 'invitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, rol)
  VALUES (new.id, new.email, 'invitado');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER update_productos_timestamp BEFORE UPDATE ON productos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ordenes_timestamp BEFORE UPDATE ON ordenes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_configuracion_timestamp BEFORE UPDATE ON configuracion FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Default configuration values
INSERT INTO configuracion (clave, valor) VALUES
  ('telefono_whatsapp', '+584141234567'),
  ('email_contacto', 'ventas@ejemplo.com'),
  ('direccion', 'Calle Principal #123, Caracas'),
  ('hero_h1', 'Seguridad Industrial de Alto Rendimiento'),
  ('hero_p', 'Protección superior para cada desafío industrial.'),
  ('hero_imagen_url', '/images/hero-default.jpg'),
  ('color_primario', '#0F172A'),
  ('color_acento', '#2563EB'),
  ('social_facebook', 'https://facebook.com'),
  ('social_instagram', 'https://instagram.com');
