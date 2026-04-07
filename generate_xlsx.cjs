const XLSX = require('xlsx');

const data = [
  {
    sku: "GU-101",
    nombre: "Guantes de Nitrilo Industrial",
    categoria: "Protección Manual",
    precio: 12.50,
    stock: 500,
    descripcion: "Guante azul de alta sensibilidad táctil para manejo químico.",
    fabricante: "Ansell",
    imagen_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    is_new: true,
    is_offer: false
  },
  {
    sku: "BO-202",
    nombre: "Bota de Seguridad Punta de Acero",
    categoria: "Calzado",
    precio: 45.99,
    stock: 120,
    descripcion: "Bota de cuero reforzada con suela antideslizante.",
    fabricante: "Caterpillar",
    imagen_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    is_new: false,
    is_offer: true
  },
  {
    sku: "CA-303",
    nombre: "Casco de Seguridad Naranja",
    categoria: "Protección Craneal",
    precio: 18.00,
    stock: 85,
    descripcion: "Casco de polietileno de alta densidad con suspensión.",
    fabricante: "MSA",
    imagen_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    is_new: false,
    is_offer: false
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Productos");
XLSX.writeFile(wb, "plantilla_inventario.xlsx");

console.log("✅ Archivo 'plantilla_inventario.xlsx' creado con éxito.");
