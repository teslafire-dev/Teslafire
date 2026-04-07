import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export interface SyncResult {
  total: number;
  added: number;
  updated: number;
  errors: string[];
}

export function useSyncProducts() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const syncFromExcel = async (file: File): Promise<SyncResult | null> => {
    setIsSyncing(true);
    setProgress(0);
    
    const result: SyncResult = {
      total: 0,
      added: 0,
      updated: 0,
      errors: []
    };

    try {
      // 1. Leer el archivo
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      result.total = jsonData.length;
      if (result.total === 0) throw new Error("El archivo está vacío");

      // 2. Procesar por lotes (batches de 50 para estabilidad)
      const batchSize = 50;
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        
        // Mapeo de datos (Excel -> DB)
        const productsToUpsert = batch.map(row => ({
          sku: String(row.sku || row.SKU || '').trim(),
          nombre: row.nombre || row.Name || row.Nombre || '',
          categoria: row.categoria || row.Category || row.Categoría || 'General',
          precio: parseFloat(row.precio || row.Price || 0),
          stock: parseInt(row.stock || row.Stock || 0),
          descripcion: row.descripcion || row.Description || '',
          fabricante: row.fabricante || row.Manufacturer || '',
          imagen_url: row.imagen_url || row.Image || null,
          is_new: !!row.nuevo || !!row.is_new,
          is_offer: !!row.oferta || !!row.is_offer,
          updated_at: new Date().toISOString()
        })).filter(p => !!p.sku && p.sku !== 'undefined'); // Filtro robusto

        if (productsToUpsert.length === 0) continue;

        // 3. Upsert en Supabase
        const { error } = await supabase
          .from('productos')
          .upsert(productsToUpsert, { 
            onConflict: 'sku',
            ignoreDuplicates: false 
          });

        if (error) {
          result.errors.push(`Error en lote ${i/batchSize + 1}: ${error.message}`);
          console.error("Batch Error:", error);
        } else {
          result.updated += productsToUpsert.length; 
        }

        setProgress(Math.round(((i + batch.length) / jsonData.length) * 100));
      }

      toast.success(`Sincronización completada: ${result.total} productos procesados.`);
      return result;

    } catch (error: any) {
      console.error("Sync Error:", error);
      toast.error(`Error de sincronización: ${error.message}`);
      return null;
    } finally {
      setIsSyncing(false);
      setProgress(100);
    }
  };

  return {
    syncFromExcel,
    isSyncing,
    progress
  };
}
