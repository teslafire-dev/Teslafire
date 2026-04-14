import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Image as ImageIcon, 
  Search, 
  Trash2, 
  Upload, 
  ExternalLink, 
  Copy, 
  Loader2,
  Filter,
  RefreshCw,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGaleria() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Listamos archivos de la carpeta 'paginas' y 'products' en el bucket
      const { data, error } = await supabase.storage.from('products').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' }
      });

      if (error) throw error;

      const filesWithUrls = data.map(file => ({
        ...file,
        url: supabase.storage.from('products').getPublicUrl(file.name).data.publicUrl
      }));

      setFiles(filesWithUrls);
    } catch (err: any) {
      toast.error("Error al cargar galería: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada al portapapeles");
  };

  const deleteFile = async (name: string) => {
    if (!confirm("¿Eliminar imagen permanentemente?")) return;
    try {
      const { error } = await supabase.storage.from('products').remove([name]);
      if (error) throw error;
      toast.success("Archivo eliminado");
      fetchFiles();
    } catch (err: any) {
      toast.error("Error al eliminar: " + err.message);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'todos' || f.name.includes(filter))
  );

  return (
    <div className="flex flex-col gap-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.4em] font-outfit">
               <ImageIcon className="w-3 h-3" /> Repositorio Visual
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">Galería de Assets</h1>
            <p className="text-slate-500 font-medium tracking-wide">Gestión centralizada de imágenes para productos y páginas.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={fetchFiles} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-accent transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <label className="bg-primary-950 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary-950/20 hover:bg-accent transition-smooth flex items-center gap-4 cursor-pointer active:scale-95">
             <Upload className="w-4 h-4" /> Subir Nueva Imagen
             <input type="file" className="hidden" onChange={async (e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               const tid = toast.loading("Subiendo...");
               const { error } = await supabase.storage.from('products').upload(`galeria/${Date.now()}-${file.name}`, file);
               if (error) toast.error("Error upload", { id: tid });
               else { toast.success("Subida con éxito", { id: tid }); fetchFiles(); }
             }} />
           </label>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de archivo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
            />
         </div>
         <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['todos', 'galeria', 'paginas'].map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === tag ? 'bg-white text-primary-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tag}
              </button>
            ))}
         </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-12 h-12 text-accent animate-spin" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sincronizando Archivos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {filteredFiles.map((file, i) => (
             <motion.div 
               key={file.id || i}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all"
             >
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                   <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={file.name} loading="lazy" />
                   <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                      <button onClick={() => copyUrl(file.url)} className="p-3 bg-white text-primary-950 rounded-xl hover:bg-accent hover:text-white transition-all shadow-xl" title="Copiar URL"><Copy className="w-4 h-4" /></button>
                      <a href={file.url} target="_blank" className="p-3 bg-white text-primary-950 rounded-xl hover:bg-accent hover:text-white transition-all shadow-xl"><ExternalLink className="w-4 h-4" /></a>
                      <button onClick={() => deleteFile(file.name)} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
                <div className="p-5 flex flex-col gap-1">
                   <span className="text-[10px] font-black text-primary-950 uppercase truncate tracking-tight">{file.name}</span>
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{(file.metadata?.size / 1024).toFixed(1)} KB • {file.metadata?.mimetype?.split('/')[1] || 'img'}</span>
                </div>
             </motion.div>
           ))}

           {filteredFiles.length === 0 && (
             <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center gap-4">
                <ImageIcon className="w-12 h-12 text-slate-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">No se encontraron imágenes en este segmento</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
