import { useParams, Link } from "react-router-dom";
import { featuredProducts } from "@/data/mockData";
import { 
  ChevronRight, 
  Download, 
  MessageCircle, 
  ShoppingCart, 
  Check, 
  Info,
  Youtube,
  Star,
  Share2
} from "lucide-react";
import { useState } from "react";
import ProductCard from "@/components/productos/ProductCard";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const product = featuredProducts.find((p) => p.id === id) || featuredProducts[0];
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price || 0,
      image: product.image
    }, quantity);

    toast.success(`${quantity} ${quantity > 1 ? 'unidades añadidas' : 'unidad añadida'} al carrito`, {
      style: {
        borderRadius: '1rem',
        background: '#0F172A',
        color: '#fff',
      },
    });
  };

  const images = [
    product.image,
    "https://images.unsplash.com/photo-1599256629241-10c0e357989d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&q=80&w=800"
  ];

  const specs = [
    { label: "Marca", value: "Ansell / MSA" },
    { label: "Material", value: "Polímero de alta densidad / Nitrilo" },
    { label: "Certificación", value: "ANSI Z89.1-2014, EN 397" },
    { label: "Color", value: "Blanco / Azul / Amarillo" },
    { label: "Peso", value: "450g" },
    { label: "Garantía", value: "12 meses" }
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-16">
          <Link to="/" className="hover:text-accent transition-smooth">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/productos" className="hover:text-accent transition-smooth">Catálogo</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary-950 font-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Gallery Side */}
          <div className="flex flex-col gap-8">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-inner">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-12 transition-smooth group-hover:scale-105" />
              <button className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl text-slate-600 hover:text-accent transition-smooth shadow-xl">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-[2rem] overflow-hidden border-4 transition-all p-3 ${selectedImage === img ? 'border-accent bg-accent/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <img src={img} alt={`${product.name} visual ${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Side */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-accent/10 text-accent text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {product.category}
                  </span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">SKU: {product.sku}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                  <span className="text-[10px] text-slate-400 font-black ml-1 uppercase tracking-widest">4.9 (124 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-primary-950 uppercase tracking-tighter leading-[0.95]">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 py-8 border-y border-slate-100">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio Unitario</span>
                   <span className="text-5xl font-black text-primary-950 font-outfit tracking-tighter leading-none">
                     {product.price ? `$${product.price.toFixed(2)}` : "A Cotizar"}
                   </span>
                </div>
                {product.price && (
                  <span className="text-slate-300 line-through text-2xl font-bold mt-4">${(product.price * 1.2).toFixed(2)}</span>
                )}
                <div className="ml-auto">
                   <div className="flex items-center gap-2 text-green-600 text-[10px] font-black px-4 py-2 bg-green-50 rounded-xl uppercase tracking-widest border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Stock Disponible
                   </div>
                </div>
              </div>
            </div>

            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Este equipo de protección personal ofrece la máxima seguridad y durabilidad en entornos industriales exigentes.
            </p>

            {/* Actions Area */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-slate-50 rounded-2xl overflow-hidden h-16 border border-slate-100 shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-16 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                  >-</button>
                  <span className="w-14 text-center font-black text-primary-950 text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-16 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                  >+</button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-950 hover:bg-accent text-white font-black h-16 rounded-2xl flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 uppercase text-xs tracking-widest"
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
