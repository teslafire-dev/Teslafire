ahora incluye 

(function () {
    // Evitar doble registro si el shell se recarga
    if (window.__tplkBuscadorProductosInit) return;
    window.__tplkBuscadorProductosInit = true;

    var CACHE = null;          // catálogo cacheado tras la primera carga
    var CACHE_TS = 0;          // cuándo se cargó (ms) — para refrescar solo
    var TTL_MS = 60000;        // caché "fresco" 60s; pasado eso se re-consulta al abrir
    var cargando = false;
    var resultados = [];       // productos visibles actualmente
    var indice = -1;           // índice resaltado
    var onSelectCb = null;     // callback activo
    var opts = {};

    var modal     = document.getElementById('tplk-modal-producto');
    var input     = document.getElementById('tplk-modal-producto-input');
    var lista     = document.getElementById('tplk-modal-producto-lista');
    var titulo    = document.getElementById('tplk-modal-producto-titulo');
    var subtitulo = document.getElementById('tplk-modal-producto-subtitulo');
    var contador  = document.getElementById('tplk-modal-producto-contador');

    // Cerrar al hacer click fuera del card
    modal.addEventListener('click', cerrar);

    function fmtPrecio(n) {
        var v = parseFloat(n) || 0;
        return '$' + v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function render() {
        if (!resultados.length) {
            lista.innerHTML = '<div class="px-6 py-10 text-center text-sm text-gray-400">No se encontraron productos.</div>';
            contador.textContent = '0 productos';
            return;
        }
        var html = '';
        resultados.forEach(function (p, i) {
            var stock = parseFloat(p.stock) || 0;
            var hay = tieneStock(p);
            var stockColor = hay ? 'text-emerald-600' : 'text-red-500';
            var stockBg    = hay ? 'bg-emerald-50' : 'bg-red-50';
            var stockLabel = p.es_servicio ? 'Servicio' : (p.es_varios ? 'Varios' : ('Stock: ' + stock.toFixed(0)));
            var activo = (i === indice);
            var noSelec = opts.bloquearSinStock && !hay;   // sin stock y no se puede elegir
            var clases = 'tplk-fila-prod flex items-center justify-between gap-4 px-5 py-3.5 transition-colors border-l-4 ' +
                   (noSelec ? 'cursor-not-allowed ' : 'cursor-pointer ') +
                   (activo ? 'bg-brand-50 border-brand-500 ' : 'hover:bg-gray-50 border-transparent ') +
                   (hay ? '' : 'opacity-50 ');   // sin stock: semitransparente
            html += '' +
              '<div class="' + clases + '" data-idx="' + i + '">' +
                '<div class="min-w-0 flex-1">' +
                  '<div class="text-sm md:text-base font-semibold text-gray-800 truncate">' + escapeHtml(p.nombre) + '</div>' +
                  '<div class="flex flex-wrap items-center gap-2 mt-1">' +
                    '<span class="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">' + escapeHtml(p.codigo_barra || p.codigo || 'Sin código') + '</span>' +
                    (p.categoria_nombre ? '<span class="text-xs text-gray-400">' + escapeHtml(p.categoria_nombre) + '</span>' : '') +
                  '</div>' +
                '</div>' +
                '<div class="flex items-center gap-3 flex-shrink-0">' +
                  '<span class="text-xs font-bold px-2.5 py-1 rounded-lg ' + stockColor + ' ' + stockBg + '">' + stockLabel + '</span>' +
                  '<span class="text-base font-black text-brand-600 min-w-[70px] text-right">' + fmtPrecio(p.precio) + '</span>' +
                '</div>' +
              '</div>';
        });
        lista.innerHTML = html;
        contador.textContent = resultados.length + ' producto' + (resultados.length === 1 ? '' : 's');

        // Click en filas
        Array.prototype.forEach.call(lista.querySelectorAll('.tplk-fila-prod'), function (el) {
            el.addEventListener('mouseenter', function () {
                indice = parseInt(el.dataset.idx, 10);
                marcarActivo();
            });
            el.addEventListener('click', function () {
                elegir(parseInt(el.dataset.idx, 10));
            });
        });
        marcarActivo();
    }

    function marcarActivo() {
        var filas = lista.querySelectorAll('.tplk-fila-prod');
        Array.prototype.forEach.call(filas, function (el, i) {
            if (i === indice) {
                el.classList.add('bg-brand-50');
                el.classList.remove('hover:bg-gray-50');
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.classList.remove('bg-brand-50');
                el.classList.add('hover:bg-gray-50');
            }
        });
    }

    // Servicio y Varios no manejan inventario: se tratan como "con stock"
    // siempre, para que nunca queden bloqueados ni al final de la lista.
    function tieneStock(p) { return !!p.es_servicio || !!p.es_varios || (parseFloat(p.stock) || 0) > 0; }

    // Primer producto que SÍ se puede elegir (para el resaltado inicial).
    function primerSeleccionable() {
        for (var i = 0; i < resultados.length; i++) {
            if (!opts.bloquearSinStock || tieneStock(resultados[i])) return i;
        }
        return -1;
    }

    function filtrar() {
        var q = input.value.trim().toLowerCase();
        var base = (CACHE || []);
        if (opts.soloConStock) {
            base = base.filter(tieneStock);
        }
        if (opts.soloCategoria) {
            base = base.filter(function (p) { return (p.categoria_nombre || '') === opts.soloCategoria; });
        }
        var arr;
        if (!q) {
            arr = base.slice();
        } else {
            // Búsqueda por PALABRAS: "inver 1000" (o "*inver*1000*") trae todo lo
            // que contenga TODAS las palabras, en cualquier orden y sin importar la marca.
            var terms = q.replace(/\*/g, ' ').split(/\s+/).filter(Boolean);
            arr = base.filter(function (p) {
                var hay = ((p.nombre || '') + ' ' + (p.codigo || '') + ' ' +
                           (p.codigo_barra || '') + ' ' + (p.referencia || '')).toLowerCase();
                return terms.every(function (t) { return hay.indexOf(t) !== -1; });
            });
        }
        // Los productos SIN stock van al FINAL. Orden estable: dentro de cada
        // grupo se conserva el alfabético que ya trae el servidor.
        arr.sort(function (a, b) { return (tieneStock(b) ? 1 : 0) - (tieneStock(a) ? 1 : 0); });
        resultados = arr.slice(0, 100);
        indice = primerSeleccionable();
        render();
    }

    function elegir(i) {
        if (i < 0 || i >= resultados.length) return;
        var producto = resultados[i];
        // En modo "solo despacho" (Nota de Entrega) los productos sin stock se
        // ven pero NO se pueden agregar.
        if (opts.bloquearSinStock && !tieneStock(producto)) {
            if (window.appToast) appToast('Sin stock disponible', 'warning');
            else if (window.appAlert) appAlert('Sin stock', 'Este producto no tiene stock disponible para despachar.', 'warning');
            return;
        }
        cerrar();
        if (typeof onSelectCb === 'function') onSelectCb(producto);
    }

    function cargarCatalogo() {
        lista.innerHTML = '<div class="px-6 py-10 flex flex-col items-center gap-3 text-gray-400">' +
            '<div class="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>' +
            '<span class="text-sm">Cargando productos...</span></div>';
        cargando = true;
        fetch('modulos/inventario/api_buscar_productos.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                cargando = false;
                CACHE = (d && d.success) ? (d.productos || []) : [];
                CACHE_TS = Date.now();
                filtrar();
            })
            .catch(function () {
                cargando = false;
                lista.innerHTML = '<div class="px-6 py-10 text-center text-sm text-red-500">Error al cargar productos.</div>';
            });
    }

    // Refresco en segundo plano: la lista visible sigue usable mientras llega
    // la versión nueva. Así un cambio hecho por otro usuario (ej. un código de
    // barra recién agregado) aparece solo, sin que nadie tenga que dar F5.
    function refrescarSilencioso() {
        if (cargando) return;
        cargando = true;
        fetch('modulos/inventario/api_buscar_productos.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                cargando = false;
                if (d && d.success) {
                    CACHE = d.productos || [];
                    CACHE_TS = Date.now();
                    if (!modal.classList.contains('hidden')) filtrar();
                }
            })
            .catch(function () { cargando = false; });
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ── Teclado ───────────────────────────────────────────────
    input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!resultados.length) return;
            indice = (indice + 1) % resultados.length;
            marcarActivo();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!resultados.length) return;
            indice = (indice - 1 + resultados.length) % resultados.length;
            marcarActivo();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            elegir(indice);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cerrar();
        }
    });

    input.addEventListener('input', filtrar);

    function abrir(onSelect, opciones) {
        onSelectCb = onSelect;
        opts = opciones || {};
        titulo.textContent = opts.titulo || 'Buscar Producto';
        if (opts.subtitulo) {
            subtitulo.textContent = opts.subtitulo;
            subtitulo.classList.remove('hidden');
        } else {
            subtitulo.textContent = '';
            subtitulo.classList.add('hidden');
        }
        input.value = '';
        indice = -1;
        resultados = [];
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // foco diferido para que el navegador lo tome bien
        setTimeout(function () { input.focus(); }, 30);

        if (CACHE === null) {
            if (!cargando) cargarCatalogo();     // primera vez: con spinner
        } else {
            filtrar();                            // instantáneo con lo cacheado
            // Si el caché ya "envejeció", lo actualizamos por detrás.
            if (Date.now() - CACHE_TS > TTL_MS) refrescarSilencioso();
        }
    }

    function cerrar() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // API global
    window.abrirBuscadorProductos = abrir;
    window.cerrarBuscadorProductos = cerrar;
})();
2. MODAL DE COBRO (tplk-modal-cobro)
javascript
(function () {
    if (window.__tplkCobroInit) return;
    window.__tplkCobroInit = true;

    var METODOS = [{"id":1,"nombre":"Divisa Efectivo ($)","moneda_id_default":1,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":0,"instrumento_caja":"divisas","orden":1},{"id":2,"nombre":"Efectivo (Bs)","moneda_id_default":2,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":0,"instrumento_caja":"efectivo","orden":2},{"id":3,"nombre":"Pago M\u00f3vil","moneda_id_default":2,"requiere_banco":1,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"transferencia","orden":3},{"id":4,"nombre":"Punto de Venta","moneda_id_default":2,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"tarjeta","orden":4},{"id":5,"nombre":"Transferencia","moneda_id_default":2,"requiere_banco":1,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"transferencia","orden":5},{"id":6,"nombre":"Zelle","moneda_id_default":1,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"transferencia","orden":6},{"id":19,"nombre":"CASHEA","moneda_id_default":1,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":0,"instrumento_caja":"transferencia","orden":8},{"id":17,"nombre":"Binance","moneda_id_default":1,"requiere_banco":0,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"transferencia","orden":10},{"id":18,"nombre":"BOFA (Bank of America)","moneda_id_default":1,"requiere_banco":1,"banco_id_default":null,"requiere_referencia":1,"instrumento_caja":"transferencia","orden":11}];
    var BANCOS  = [{"id":1,"nombre_banco":"Banco de Venezuela \u2014 Cta. Corriente Bs","numero_cuenta":"0102-0000-00-0000000000","moneda_id":2,"es_base":0,"moneda_codigo":"BS"},{"id":2,"nombre_banco":"Banesco \u2014 Cta. Corriente Bs","numero_cuenta":"0134-0000-00-0000000000","moneda_id":2,"es_base":0,"moneda_codigo":"BS"},{"id":3,"nombre_banco":"Caja Fuerte Divisas ($)","numero_cuenta":null,"moneda_id":1,"es_base":1,"moneda_codigo":"USD"}];
    var MONEDAS = [{"id":1,"codigo":"USD","simbolo":"$","tasa_cambio":"1.000000","es_base":1},{"id":2,"codigo":"BS","simbolo":"Bs.","tasa_cambio":"804.810000","es_base":0}];
    var TASA_BCV      = 804.81;
    var TASA_PARALELA = 990;
    var TASA          = TASA_BCV;   // tasa activa; se fija por canal al abrir
    // Alicuota del IGTF (Ajustes -> Precios). En 0 el impuesto no existe para
    // esta empresa y el modal se comporta exactamente como antes.
    var IGTF_PCT      = 0;

    var monedaById = {};
    MONEDAS.forEach(function (m) { monedaById[m.id] = m; });

    // ── Cuentas bancarias por moneda ─────────────────────────────
    // Un cobro en $ solo debe poder caer en una cuenta en $. Si no hay
    // ninguna de esa moneda se muestran todas y se avisa: mejor un cajero
    // advertido que un cobro que no se puede guardar.
    var bancosSinFiltro = false;
    function bancosDeMoneda(esBase) {
        var f = BANCOS.filter(function (b) { return (b.es_base == 1) === !!esBase; });
        bancosSinFiltro = (f.length === 0);
        return f.length ? f : BANCOS;
    }
    // Cuenta por defecto del método, si sigue activa y es de la moneda del pago.
    function bancoDefault(met, esBase) {
        var id = parseInt(met && met.banco_id_default, 10) || 0;
        if (!id) return '';
        var ok = bancosDeMoneda(esBase).some(function (b) { return parseInt(b.id, 10) === id; });
        return ok ? id : '';
    }
    function bancoPorId(id) {
        var f = BANCOS.filter(function (b) { return parseInt(b.id, 10) === parseInt(id, 10); });
        return f.length ? f[0] : null;
    }
    // Cuando el método tiene su cuenta fija (Zelle → cuenta Zelle) NO se le
    // pregunta nada a quien cobra: se muestra a dónde entra y ya. Elegir a mano
    // solo tiene sentido cuando de verdad hay varias opciones (pago móvil).
    function avisoBancoFijo(banco_id, texto) {
        var b = bancoPorId(banco_id);
        if (!b) return '';
        return '<div class="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5">' +
               '<span>🏦</span><span>' + texto + ' <b>' + esc(b.nombre_banco) + '</b></span></div>';
    }

    var NC_ID = -1;   // método virtual: Billetera (saldo a favor)
    var NC_PATH = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';

    var totalUsd       = 0;
    var lineas         = [];     // pagos registrados {metodo_id, nombre, esBase, montoBs, montoUsd, referencia, banco_id, isNC}
    var entry          = null;   // captura en curso
    var onConfirmCb    = null;
    var confirmLabel   = 'Confirmar Cobro';
    var modo           = 'modal';
    var saldoFavorDisp = 0;      // saldo a favor del cliente (USD)
    var clienteId      = 0;
    var vueltoSel      = null;   // cómo se entrega el vuelto {metodo_id, nombre, esBase, moneda_id, banco_id, referencia, isFavor}

    var modal = document.getElementById('tplk-modal-cobro');
    var panel = document.getElementById('cobro-panel');
    var PANEL_MODAL = 'w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] outline-none';
    var PANEL_FULL  = 'w-full h-full max-w-none bg-white rounded-none shadow-2xl flex flex-col overflow-hidden outline-none';

    function round2(n) { return Math.round((parseFloat(n) || 0) * 100) / 100; }
    function fmtUsd(n) { return '$' + round2(n).toFixed(2); }
    function fmtBs(n)  { return 'Bs ' + (parseFloat(n) || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.').replace('.', ','); }
    function esc(s)    { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function metodoById(id) { return METODOS.find(function (m) { return m.id == id; }); }
    function focusPanel() { if (panel) panel.focus(); }

    function svgWrap(path, cls) {
        return '<svg class="' + (cls || 'w-5 h-5') + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + path + '"></path></svg>';
    }

    // Íconos por método (heurística por nombre + moneda)
    function iconPath(m) {
        var n = (m && m.nombre ? m.nombre : '').toLowerCase();
        var mon = monedaById[m && m.moneda_id_default] || {};
        var esBase = (mon.es_base == 1);
        if (/zelle|paypal|binance|usdt|cripto|stripe|reserve|wally/.test(n))
            return 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9';
        if (/m[oó]vil|pago m/.test(n))
            return 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z';
        if (/punto|tarjeta|\bpos\b|tdc|tdd|d[eé]bito|cr[eé]dito|visa|master/.test(n))
            return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
        if (/transfer/.test(n))
            return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4';
        if (/efect/.test(n) && !esBase)
            return 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z';
        if (esBase || /d[oó]lar|divisa|usd|\$/.test(n))
            return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
    }
    function iconSvg(m, cls) { return svgWrap(iconPath(m), cls); }

    function pagadoUsd()   { return round2(lineas.reduce(function (s, l) { return s + (parseFloat(l.montoUsd) || 0); }, 0)); }

    // ── IGTF ──
    // Grava lo que el cliente paga en DIVISAS, así que no se puede calcular
    // antes de saber cómo va a pagar: se recalcula con cada línea que se
    // agrega. Una nota de crédito o un saldo a favor no son divisas recibidas
    // y quedan fuera.
    function pagadoDivisasUsd() {
        return round2(lineas.reduce(function (s, l) {
            return s + ((l.esBase && !l.isNC && !l.isFavor) ? (parseFloat(l.montoUsd) || 0) : 0);
        }, 0));
    }
    function igtfUsd() {
        if (!(IGTF_PCT > 0)) return 0;
        return round2(pagadoDivisasUsd() * IGTF_PCT / 100);
    }
    // Lo que hay que cobrar sube con el IGTF que generen los pagos en divisas.
    function totalConIgtf() { return round2(totalUsd + igtfUsd()); }
    function restanteUsd()  { return round2(totalConIgtf() - pagadoUsd()); }
    function ncUsado()     { return round2(lineas.reduce(function (s, l) { return s + (l.isNC ? (parseFloat(l.montoUsd) || 0) : 0); }, 0)); }
    function ncDisponible(){ return round2(saldoFavorDisp - ncUsado()); }
    function ncVisible()   { return ncDisponible() > 0.005; }

    // ============ API pública ============
    window.abrirModalCobro = function (total, opciones) {
        opciones = opciones || {};
        totalUsd       = round2(total);
        onConfirmCb    = opciones.onConfirm || null;
        confirmLabel   = opciones.confirmLabel || 'Confirmar Cobro';
        modo           = (opciones.modo === 'pantalla') ? 'pantalla' : 'modal';
        saldoFavorDisp = round2(opciones.saldoFavor || 0);
        clienteId      = parseInt(opciones.clienteId || 0, 10) || 0;
        lineas = [];
        entry  = null;
        vueltoSel = null;
        window.__tplkVuelto = null;

        var canal = opciones.canal || 'detal';
        // Detal cobra a BCV (su precio ya es el Detal BCV); el resto a paralela.
        TASA = (canal === 'detal') ? TASA_BCV : TASA_PARALELA;

        // Marco: pantalla completa (no modal) o modal flotante
        if (modo === 'pantalla') {
            modal.className = 'fixed inset-0 z-[9995] flex items-stretch justify-center bg-gray-100';
            panel.className = PANEL_FULL;
            document.getElementById('cobro-volver').classList.remove('hidden');
            document.getElementById('cobro-volver').classList.add('flex');
            document.getElementById('cobro-x').classList.add('hidden');
            document.getElementById('cobro-confirmar-lbl').textContent = confirmLabel;
            document.getElementById('cobro-cancelar-lbl').textContent = 'Volver';
        } else {
            modal.className = 'fixed inset-0 z-[9995] flex items-start justify-center px-3 md:px-6 pt-[4vh] pb-6 bg-black/60 backdrop-blur-sm';
            panel.className = PANEL_MODAL;
            document.getElementById('cobro-volver').classList.add('hidden');
            document.getElementById('cobro-volver').classList.remove('flex');
            document.getElementById('cobro-x').classList.remove('hidden');
            document.getElementById('cobro-confirmar-lbl').textContent = confirmLabel;
            document.getElementById('cobro-cancelar-lbl').textContent = 'Cancelar';
        }

        var cliLbl = document.getElementById('cobro-cliente-lbl');
        if (opciones.clienteNombre) { cliLbl.textContent = opciones.clienteNombre; cliLbl.classList.remove('hidden'); }
        else { cliLbl.classList.add('hidden'); }

        document.getElementById('cobro-tasa-lbl').textContent  = 'Tasa';
        document.getElementById('cobro-tasa').textContent      = (TASA || 0).toFixed(2).replace('.', ',');
        document.getElementById('cobro-total-usd').textContent = fmtUsd(totalUsd);
        document.getElementById('cobro-total-bs').textContent  = fmtBs(totalUsd * TASA);

        renderEntry();
        render();   // render() ya pinta los botones de método

        setTimeout(focusPanel, 50);
    };

    window.cerrarModalCobro = function () {
        entry = null;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // ============ Botones de método ============
    function renderMetodosBtns() {
        var cont = document.getElementById('cobro-metodos-btns');
        var html = METODOS.map(function (m, i) {
            var mon = monedaById[m.moneda_id_default] || {};
            var esBase = (mon.es_base == 1);
            var tag = esBase ? 'Divisa $' : 'Bolívares';
            // Tecla rápida (1-9) como "keycap" grande y visible a la izquierda del método.
            var keycap = (i < 9)
                ? '<span class="w-9 h-9 rounded-lg bg-gray-800 group-hover:bg-emerald-600 text-white text-xl font-black flex items-center justify-center shrink-0 shadow-sm">' + (i + 1) + '</span>'
                : '';
            return '<button type="button" onclick="cobroSelMetodo(' + m.id + ')" ' +
                'class="relative flex items-center gap-2.5 px-3 py-3 border-2 border-gray-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50 transition-colors group">' +
                keycap +
                '<span class="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 shrink-0">' + iconSvg(m) + '</span>' +
                '<span class="min-w-0 flex-1">' +
                    '<span class="block text-sm font-bold text-gray-700 leading-tight truncate">' + esc(m.nombre) + '</span>' +
                    '<span class="block text-[10px] font-semibold ' + (esBase ? 'text-emerald-600' : 'text-brand-500') + '">' + tag + '</span>' +
                '</span>' +
                '</button>';
        }).join('');

        if (ncVisible()) {
            var ncKeycap = (METODOS.length < 9)
                ? '<span class="w-9 h-9 rounded-lg bg-brand-600 group-hover:bg-brand-700 text-white text-xl font-black flex items-center justify-center shrink-0 shadow-sm">' + (METODOS.length + 1) + '</span>'
                : '';
            html += '<button type="button" onclick="cobroSelNC()" ' +
                'class="relative flex items-center gap-2.5 px-3 py-3 border-2 border-brand-200 rounded-xl text-left hover:border-brand-500 hover:bg-brand-50 transition-colors group col-span-2">' +
                ncKeycap +
                '<span class="w-8 h-8 rounded-lg bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center text-brand-600 shrink-0">' + svgWrap(NC_PATH) + '</span>' +
                '<span class="min-w-0 flex-1">' +
                    '<span class="block text-sm font-bold text-brand-700 leading-tight truncate">Billetera (Saldo a favor)</span>' +
                    '<span class="block text-[10px] font-semibold text-brand-500">Disponible ' + fmtUsd(ncDisponible()) + '</span>' +
                '</span>' +
                '</button>';
        }
        cont.innerHTML = html;
    }

    window.cobroSelMetodo = function (metodo_id) {
        var met = metodoById(metodo_id);
        if (!met) return;
        var mon = monedaById[met.moneda_id_default] || {};
        var esBase = (mon.es_base == 1);
        var rest = Math.max(0, restanteUsd());
        entry = {
            metodo_id: metodo_id,
            nombre: met.nombre,
            esBase: esBase,
            montoUsd: rest,
            montoBs: round2(rest * TASA),
            referencia: '',
            // Cuenta por defecto del método (ej. Zelle → cuenta Zelle). Si la
            // tiene, ni siquiera se muestra el desplegable: el cobro entra ahí
            // solo. Se acepta únicamente si sigue activa y es de la moneda del pago.
            banco_id: bancoDefault(met, esBase),
            bancoFijo: (bancoDefault(met, esBase) !== ''),
            requiereBanco: (met.requiere_banco == 1),
            requiereRef: (met.requiere_referencia == 1),
            requiereComp: (met.instrumento_caja === 'transferencia'),
            isNC: false
        };
        renderEntry();
    };

    window.cobroSelNC = function () {
        if (!ncVisible()) return;
        var cap = Math.max(0, Math.min(ncDisponible(), restanteUsd()));
        if (cap <= 0.005) { if (typeof appToast === 'function') appToast('No hay restante para Billetera', 'info'); return; }
        entry = {
            metodo_id: NC_ID,
            nombre: 'Billetera',
            esBase: true,
            montoUsd: round2(cap),
            montoBs: round2(cap * TASA),
            referencia: '',
            banco_id: '',
            requiereBanco: false,
            requiereRef: false,
            isNC: true
        };
        renderEntry();
    };

    // ============ Panel de captura ============
    function renderEntry() {
        var box = document.getElementById('cobro-entry');
        if (!entry) { box.classList.add('hidden'); box.innerHTML = ''; return; }
        var met = entry.isNC ? null : (metodoById(entry.metodo_id) || {});

        var lblCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1';
        var inpCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-bold text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none';

        var amounts;
        if (entry.esBase) {
            amounts = '<div><label class="' + lblCls + '">Monto $</label>' +
                '<input id="cobro-entry-usd" type="number" step="0.01" min="0" value="' + (entry.montoUsd || '') + '" oninput="cobroEntryEditUsd(this.value)" class="' + inpCls + '"></div>';
        } else {
            amounts = '<div class="grid grid-cols-2 gap-2">' +
                '<div><label class="' + lblCls + '">Monto Bs</label>' +
                    '<input id="cobro-entry-bs" type="number" step="0.01" min="0" value="' + (entry.montoBs || '') + '" oninput="cobroEntryEditBs(this.value)" class="' + inpCls + '"></div>' +
                '<div><label class="' + lblCls + '">Monto $</label>' +
                    '<input id="cobro-entry-usd" type="number" step="0.01" min="0" value="' + (entry.montoUsd || '') + '" oninput="cobroEntryEditUsd(this.value)" class="' + inpCls + ' bg-gray-50"></div>' +
                '</div>';
        }

        var extraHtml = '';
        if (entry.isNC) {
            extraHtml = '<div class="mt-2 text-[11px] text-brand-600 font-semibold">Disponible: ' + fmtUsd(ncDisponible()) + ' · No genera vuelto</div>';
        } else if (entry.requiereBanco) {
            if (!BANCOS.length) {
                extraHtml = '<div class="mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">⚠ No hay cuentas bancarias. Configúralas en <b>Finanzas → Cuentas Bancarias</b>.</div>';
            } else if (entry.bancoFijo) {
                extraHtml = avisoBancoFijo(entry.banco_id, 'Entra a');
            } else {
                var lista = bancosDeMoneda(entry.esBase);
                var opts = '<option value="">— Banco destino —</option>' + lista.map(function (b) {
                    return '<option value="' + b.id + '" ' + (entry.banco_id == b.id ? 'selected' : '') + '>' +
                           esc(b.nombre_banco) + ' (' + esc(b.moneda_codigo) + ')</option>';
                }).join('');
                extraHtml = '<div class="mt-2"><label class="' + lblCls + '">Banco destino</label>' +
                    '<select id="cobro-entry-banco" onchange="cobroEntrySetBanco(this.value)" class="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">' + opts + '</select>' +
                    (bancosSinFiltro
                        ? '<div class="mt-1 text-[10px] text-amber-600">No hay cuentas en la moneda de este pago; se muestran todas. Revisa bien cuál eliges.</div>'
                        : '') + '</div>';
            }
        }
        var refHtml = '';
        if (!entry.isNC && (entry.requiereBanco || entry.requiereRef)) {
            refHtml = '<div class="mt-2"><label class="' + lblCls + '">Referencia (últimos dígitos)</label>' +
                '<input id="cobro-entry-ref" type="text" value="' + esc(entry.referencia || '') + '" oninput="cobroEntrySetRef(this.value)" placeholder="Nº de referencia / voucher" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"></div>';
        }

        // Comprobante de pago: OBLIGATORIO en transferencias (Pago Móvil, Transferencia,
        // Zelle...) porque sin él no se puede conciliar; opcional en el resto.
        var compHtml = '';
        if (!entry.isNC) {
            var compOblig = !!entry.requiereComp;
            compHtml = '<div class="mt-2"><label class="' + lblCls + '">Comprobante de pago ' +
                (compOblig ? '<span class="text-red-500 font-bold">*</span>' : '(opcional)') + '</label>' +
                '<div class="flex items-center gap-2">' +
                    '<input id="cobro-entry-comp" type="file" accept="image/*,application/pdf" onchange="cobroEntrySubirComprobante(this)" class="flex-1 min-w-0 text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700 file:font-bold file:cursor-pointer">' +
                    '<button type="button" id="cobro-entry-comp-btn" onclick="cobroEntryPegarComprobante()" title="Pegar imagen del portapapeles (Ctrl+V)" class="shrink-0 inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">' +
                        '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' +
                        'Pegar' +
                    '</button>' +
                '</div>' +
                '<div id="cobro-entry-comp-msg" class="text-[11px] mt-1 ' + (entry.comprobante ? 'text-emerald-600' : (compOblig ? 'text-red-500 font-semibold' : 'text-gray-400')) + '">' +
                    (entry.comprobante ? '✓ Comprobante adjuntado'
                                       : (compOblig ? 'Obligatorio: adjunta o pega (Ctrl+V) la foto o PDF del pago'
                                                    : 'Adjunta o pega (Ctrl+V) foto o PDF del pago (opcional)')) + '</div>' +
                '<div id="cobro-entry-comp-preview" class="mt-2">' + previewComprobanteHtml(entry.comprobante) + '</div></div>';
        }

        var acc = entry.isNC ? 'brand' : 'emerald';
        var headIcon = entry.isNC ? svgWrap(NC_PATH, 'w-4 h-4') : iconSvg(met, 'w-4 h-4');
        box.innerHTML =
            '<div class="border-2 border-' + acc + '-400 rounded-2xl p-4 bg-' + acc + '-50/40">' +
                '<div class="flex items-center gap-2 mb-3 text-' + acc + '-700">' +
                    '<span class="w-7 h-7 rounded-lg bg-' + acc + '-100 flex items-center justify-center">' + headIcon + '</span>' +
                    '<span class="text-sm font-black">' + esc(entry.nombre) + '</span>' +
                '</div>' +
                amounts + extraHtml + refHtml + compHtml +
                '<div class="flex gap-2 mt-3">' +
                    '<button type="button" onclick="cobroEntryCancelar()" class="flex-1 py-2.5 rounded-lg font-bold text-sm bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>' +
                    '<button type="button" onclick="cobroEntryAgregar()" class="flex-1 py-2.5 rounded-lg font-black text-sm text-white bg-' + acc + '-600 hover:bg-' + acc + '-700 transition-colors">Agregar</button>' +
                '</div>' +
            '</div>';
        box.classList.remove('hidden');

        setTimeout(function () {
            var f = document.getElementById('cobro-entry-' + (entry.esBase ? 'usd' : 'bs'));
            if (f) { f.focus(); if (f.select) f.select(); }
            if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest' });
        }, 30);
    }

    window.cobroEntryEditBs = function (val) {
        if (!entry) return;
        entry.montoBs = round2(val);
        entry.montoUsd = TASA > 0 ? round2(entry.montoBs / TASA) : 0;
        var u = document.getElementById('cobro-entry-usd');
        if (u) u.value = entry.montoUsd;
    };
    window.cobroEntryEditUsd = function (val) {
        if (!entry) return;
        entry.montoUsd = round2(val);
        entry.montoBs = round2(entry.montoUsd * TASA);
        var b = document.getElementById('cobro-entry-bs');
        if (b) b.value = entry.montoBs;
    };
    window.cobroEntrySetBanco = function (val) { if (entry) entry.banco_id = val; };
    window.cobroEntrySetRef   = function (val) { if (entry) entry.referencia = val; };

    // Genera el HTML de la vista previa según la ruta del comprobante.
    // Imagen → miniatura clicable; PDF → enlace; vacío → nada.
    function previewComprobanteHtml(path) {
        if (!path) return '';
        var esPdf = /\.pdf($|\?)/i.test(path);
        if (esPdf) {
            return '<a href="' + esc(path) + '" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">' +
                '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>' +
                'Ver PDF adjunto</a>';
        }
        return '<a href="' + esc(path) + '" target="_blank" rel="noopener" title="Clic para ampliar" class="inline-block">' +
            '<img src="' + esc(path) + '" alt="Comprobante" ' +
                'onerror="this.style.display=\'none\';this.insertAdjacentHTML(\'afterend\',\'<span class=&quot;text-[11px] text-emerald-600 font-semibold&quot;>✓ Comprobante guardado (abrir en pestaña)</span>\');" ' +
                'class="max-h-40 w-auto rounded-lg border border-gray-200 shadow-sm object-contain bg-gray-50">' +
            '</a>';
    }

    // Refresca el recuadro de vista previa con la ruta actual.
    function refrescarPreviewComprobante(path) {
        var box = document.getElementById('cobro-entry-comp-preview');
        if (box) box.innerHTML = previewComprobanteHtml(path);
    }

    // Pone el mensaje de estado (con o sin spinner) bajo el comprobante.
    function setCompMsg(texto, cls, spinner) {
        var msg = document.getElementById('cobro-entry-comp-msg');
        if (!msg) return;
        msg.className = 'text-[11px] mt-1 flex items-center gap-1 ' + (cls || 'text-gray-400');
        var spin = spinner
            ? '<svg class="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>'
            : '';
        msg.innerHTML = spin + '<span>' + esc(texto) + '</span>';
    }

    // Habilita/deshabilita los controles de comprobante mientras sube.
    function setCompLoading(cargando) {
        var inp = document.getElementById('cobro-entry-comp');
        var btn = document.getElementById('cobro-entry-comp-btn');
        if (inp) inp.disabled = cargando;
        if (btn) { btn.disabled = cargando; btn.classList.toggle('opacity-50', cargando); btn.classList.toggle('cursor-not-allowed', cargando); }
    }

    // Subida real del comprobante (archivo o imagen pegada). Se sube al momento
    // y se guarda la ruta en el pago. Acepta un File/Blob directamente.
    function cobroSubirComprobanteFile(file) {
        if (!entry || !file) return;
        // Validación rápida en el cliente (el servidor re-valida).
        if (file.size && file.size > 5 * 1024 * 1024) {
            setCompMsg('El archivo excede los 5 MB permitidos.', 'text-red-500', false);
            return;
        }
        setCompMsg('Subiendo comprobante…', 'text-gray-500', true);
        setCompLoading(true);

        var fd = new FormData();
        // Si es un blob pegado sin nombre, le damos uno con extensión válida.
        var nombre = file.name || ('pegado_' + (file.type === 'image/png' ? 'img.png' : 'img.jpg'));
        fd.append('archivo', file, nombre);

        fetch('modulos/ventas/api_subir_comprobante.php', { method: 'POST', body: fd })
            .then(function (r) {
                // Leemos como texto para no romper si el servidor devuelve algo que no es JSON.
                return r.text().then(function (txt) {
                    var d;
                    try { d = JSON.parse(txt); }
                    catch (e) {
                        throw new Error(txt ? ('Respuesta del servidor: ' + txt.slice(0, 120)) : ('HTTP ' + r.status));
                    }
                    return d;
                });
            })
            .then(function (d) {
                setCompLoading(false);
                if (d && d.ok) {
                    if (entry) entry.comprobante = d.path;
                    setCompMsg('✓ Comprobante adjuntado', 'text-emerald-600 font-semibold', false);
                    try { refrescarPreviewComprobante(d.path); } catch (e) {}
                } else {
                    if (entry) entry.comprobante = '';
                    setCompMsg((d && d.error) || 'No se pudo subir el comprobante', 'text-red-500', false);
                    try { refrescarPreviewComprobante(''); } catch (e) {}
                }
            })
            .catch(function (err) {
                setCompLoading(false);
                setCompMsg((err && err.message) ? err.message : 'Error de red al subir', 'text-red-500', false);
            });
    }

    // Desde el <input type=file>.
    window.cobroEntrySubirComprobante = function (input) {
        if (!entry || !input.files || !input.files[0]) return;
        cobroSubirComprobanteFile(input.files[0]);
    };

    // Extrae la primera imagen de un DataTransfer/Clipboard items y la sube.
    function cobroSubirDesdeItems(items) {
        if (!items) return false;
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.kind === 'file' && it.type && it.type.indexOf('image/') === 0) {
                var blob = it.getAsFile();
                if (blob) { cobroSubirComprobanteFile(blob); return true; }
            }
        }
        return false;
    }

    // Botón "Pegar": lee el portapapeles con la API asíncrona (requiere gesto del usuario).
    window.cobroEntryPegarComprobante = function () {
        if (!entry) return;
        var msg = document.getElementById('cobro-entry-comp-msg');
        if (!navigator.clipboard || !navigator.clipboard.read) {
            if (msg) { msg.textContent = 'Tu navegador no soporta pegar. Usa Ctrl+V sobre la ventana.'; msg.className = 'text-[11px] mt-1 text-amber-600'; }
            return;
        }
        navigator.clipboard.read().then(function (contenido) {
            for (var i = 0; i < contenido.length; i++) {
                var tipos = contenido[i].types || [];
                for (var j = 0; j < tipos.length; j++) {
                    if (tipos[j].indexOf('image/') === 0) {
                        return contenido[i].getType(tipos[j]).then(function (blob) {
                            cobroSubirComprobanteFile(blob);
                        });
                    }
                }
            }
            if (msg) { msg.textContent = 'No hay ninguna imagen en el portapapeles.'; msg.className = 'text-[11px] mt-1 text-amber-600'; }
        }).catch(function () {
            if (msg) { msg.textContent = 'No se pudo leer el portapapeles. Prueba con Ctrl+V.'; msg.className = 'text-[11px] mt-1 text-amber-600'; }
        });
    };

    // Ctrl+V en cualquier parte del modal (con un cobro abierto) pega la imagen.
    document.addEventListener('paste', function (e) {
        if (modal.classList.contains('hidden')) return;
        if (!entry || entry.isNC) return;
        var dt = e.clipboardData || window.clipboardData;
        if (dt && cobroSubirDesdeItems(dt.items)) { e.preventDefault(); }
    });

    window.cobroEntryCancelar = function () { entry = null; renderEntry(); setTimeout(focusPanel, 30); };

    window.cobroEntryAgregar = function () {
        if (!entry) return;

        if (entry.isNC) {
            var cap = Math.max(0, Math.min(ncDisponible(), restanteUsd()));
            var m = round2(entry.montoUsd);
            if (m <= 0) { appAlert('Monto inválido', 'Ingresa un monto mayor a 0.', 'warning'); return; }
            if (m > cap + 0.005) m = cap;   // clamp a lo disponible / restante (NC no genera vuelto)
            if (m <= 0) { appAlert('Sin restante', 'La nota de crédito no puede aplicarse (no hay restante o saldo disponible).', 'warning'); return; }
            lineas.push({ metodo_id: null, nombre: 'Billetera', esBase: true, montoUsd: m, montoBs: round2(m * TASA), referencia: '', banco_id: '', isNC: true });
            entry = null; renderEntry(); render(); setTimeout(focusPanel, 30);
            return;
        }

        var met = metodoById(entry.metodo_id);
        if (!met) return;
        var nativeMonto = entry.esBase ? round2(entry.montoUsd) : round2(entry.montoBs);
        if (nativeMonto <= 0) { appAlert('Monto inválido', 'Ingresa un monto mayor a 0.', 'warning'); return; }
        if (entry.requiereBanco && BANCOS.length && !entry.banco_id) { appAlert('Falta banco', 'Selecciona el banco destino.', 'warning'); return; }
        // Referencia obligatoria para pagos electrónicos (pago móvil / transferencia / con banco)
        // → garantiza que el cobro sea conciliable contra el archivo del banco.
        if ((entry.requiereBanco || entry.requiereRef) && !String(entry.referencia || '').trim()) {
            appAlert('Falta referencia', 'Ingresa el número de referencia / voucher del pago electrónico.', 'warning');
            var rf = document.getElementById('cobro-entry-ref');
            if (rf) rf.focus();
            return;
        }
        // Comprobante obligatorio en transferencias (Pago Móvil, Transferencia, Zelle...).
        // El servidor lo vuelve a exigir en CobroController.
        if (entry.requiereComp && !String(entry.comprobante || '').trim()) {
            appAlert('Falta el comprobante', 'El pago por "' + met.nombre + '" exige adjuntar el comprobante. Súbelo o pégalo con Ctrl+V.', 'warning');
            var cf = document.getElementById('cobro-entry-comp');
            if (cf) cf.focus();
            return;
        }

        lineas.push({
            metodo_id: entry.metodo_id,
            nombre: met.nombre,
            esBase: entry.esBase,
            montoBs: entry.esBase ? round2(entry.montoUsd * TASA) : round2(entry.montoBs),
            montoUsd: round2(entry.montoUsd),
            referencia: entry.referencia || '',
            banco_id: entry.banco_id || '',
            comprobante: entry.comprobante || '',
            isNC: false
        });
        entry = null; renderEntry(); render(); setTimeout(focusPanel, 30);
    };

    window.cobroQuitarLinea = function (i) { lineas.splice(i, 1); render(); setTimeout(focusPanel, 30); };

    // ============ Lista de pagos registrados ============
    function render() {
        renderMetodosBtns();
        var cont  = document.getElementById('cobro-lineas');
        var vacio = document.getElementById('cobro-vacio');
        vacio.style.display = lineas.length ? 'none' : 'block';

        cont.innerHTML = lineas.map(function (l, i) {
            var nativeStr = l.esBase ? fmtUsd(l.montoUsd) : fmtBs(l.montoBs);
            var eqStr     = l.esBase ? fmtBs(l.montoBs)   : fmtUsd(l.montoUsd);
            var refBadge  = l.referencia ? ' <span class="text-[9px] text-gray-400 font-mono">#' + esc(l.referencia) + '</span>' : '';
            var icon = l.isNC ? svgWrap(NC_PATH, 'w-4 h-4') : iconSvg(metodoById(l.metodo_id) || {}, 'w-4 h-4');
            var iconBg = l.isNC ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600';
            return '<div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">' +
                '<span class="w-7 h-7 rounded-lg ' + iconBg + ' flex items-center justify-center shrink-0">' + icon + '</span>' +
                '<div class="min-w-0 flex-1">' +
                    '<div class="text-xs font-bold text-gray-800 truncate">' + esc(l.nombre) + refBadge + '</div>' +
                    '<div class="text-[11px] text-gray-400">' + eqStr + '</div>' +
                '</div>' +
                '<div class="text-sm font-black text-gray-800 shrink-0">' + nativeStr + '</div>' +
                '<button type="button" onclick="cobroQuitarLinea(' + i + ')" class="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 shrink-0">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>' +
                '</div>';
        }).join('');
        actualizarTotales();
    }

    function actualizarTotales() {
        var pagado = pagadoUsd();
        document.getElementById('cobro-pagado').textContent = fmtUsd(pagado);

        // El total sube con el IGTF que generan los pagos en divisas, así que
        // se repinta cada vez: el cajero ve en el momento cuánto sumó.
        var igtf   = igtfUsd();
        var totCon = totalConIgtf();
        var elIgtf = document.getElementById('cobro-igtf');
        if (elIgtf) {
            if (igtf > 0.005) {
                elIgtf.textContent = '+ IGTF ' + IGTF_PCT.toFixed(2).replace('.', ',') + '% sobre '
                                   + fmtUsd(pagadoDivisasUsd()) + ' en divisas = ' + fmtUsd(igtf);
                elIgtf.classList.remove('hidden');
            } else {
                elIgtf.classList.add('hidden');
            }
        }
        document.getElementById('cobro-total-usd').textContent = fmtUsd(totCon);
        document.getElementById('cobro-total-bs').textContent  = fmtBs(totCon * TASA);

        var diff = round2(pagado - totCon);
        var box = document.getElementById('cobro-restante-box');
        var lbl = document.getElementById('cobro-restante-lbl');
        var u   = document.getElementById('cobro-restante-usd');
        var b   = document.getElementById('cobro-restante-bs');
        var btn = document.getElementById('cobro-confirmar');

        if (diff < -0.01) {
            var falta = Math.abs(diff);
            lbl.textContent = 'Restante';
            u.textContent = fmtUsd(falta);
            b.textContent = fmtBs(falta * TASA);
            box.className = 'text-right rounded-xl px-4 py-2 bg-red-500/15 text-red-300';
        } else if (diff > 0.01) {
            lbl.textContent = 'Vuelto';
            u.textContent = fmtUsd(diff);
            b.textContent = fmtBs(diff * TASA);
            box.className = 'text-right rounded-xl px-4 py-2 bg-orange-500/20 text-orange-300';
        } else {
            lbl.textContent = 'Exacto';
            u.textContent = fmtUsd(0);
            b.textContent = fmtBs(0);
            box.className = 'text-right rounded-xl px-4 py-2 bg-emerald-500/20 text-emerald-300';
        }

        renderVueltoBox();
        actualizarBotonConfirmar();
    }

    // ============ Vuelto: cómo se le entrega al cliente ============
    function vueltoUsd() { return round2(pagadoUsd() - totalUsd); }

    // Completo = ya se eligió el destino y trae lo que ese método exige.
    function vueltoCompleto() {
        if (!vueltoSel) return false;
        if (vueltoSel.isFavor || vueltoSel.isSobrante) return true;
        var met = metodoById(vueltoSel.metodo_id);
        if (!met) return false;
        if (met.requiere_banco == 1 && BANCOS.length && !vueltoSel.banco_id) return false;
        if ((met.requiere_banco == 1 || met.requiere_referencia == 1) && !String(vueltoSel.referencia || '').trim()) return false;
        return true;
    }

    function actualizarBotonConfirmar() {
        var btn = document.getElementById('cobro-confirmar');
        if (!btn) return;
        var diff = round2(pagadoUsd() - totalUsd);
        if (diff < -0.01) { btn.disabled = true; return; }
        btn.disabled = (diff > 0.01) && !vueltoCompleto();
    }

    function renderVueltoBox() {
        var wrap = document.getElementById('cobro-vuelto-wrap');
        if (!wrap) return;
        var v = vueltoUsd();
        if (v <= 0.01) { wrap.classList.add('hidden'); vueltoSel = null; return; }
        wrap.classList.remove('hidden');
        document.getElementById('cobro-vuelto-monto').textContent = fmtUsd(v) + ' · ' + fmtBs(v * TASA);

        // Cada método muestra el monto en SU moneda, para que el asesor sepa
        // cuánto entregar sin sacar la cuenta.
        var html = METODOS.map(function (m) {
            var mon    = monedaById[m.moneda_id_default] || {};
            var esBase = (mon.es_base == 1);
            var sel    = !!(vueltoSel && !vueltoSel.isFavor && vueltoSel.metodo_id == m.id);
            return '<button type="button" onclick="cobroSelVuelto(' + m.id + ')" ' +
                'class="border-2 rounded-xl px-2.5 py-2 text-left transition-colors ' +
                (sel ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white hover:border-orange-400') + '">' +
                '<span class="block text-xs font-bold text-gray-800 leading-tight truncate">' + esc(m.nombre) + '</span>' +
                '<span class="block text-[11px] font-black ' + (esBase ? 'text-emerald-600' : 'text-brand-600') + '">' +
                    (esBase ? fmtUsd(v) : fmtBs(v * TASA)) + '</span>' +
                '</button>';
        }).join('');

        if (clienteId > 0) {
            var selF = !!(vueltoSel && vueltoSel.isFavor);
            html += '<button type="button" onclick="cobroSelVueltoFavor()" ' +
                'class="border-2 rounded-xl px-2.5 py-2 text-left transition-colors ' +
                (selF ? 'border-amber-500 bg-amber-100' : 'border-amber-200 bg-white hover:border-amber-400') + '">' +
                '<span class="block text-xs font-bold text-amber-800 leading-tight truncate">Saldo a favor</span>' +
                '<span class="block text-[11px] font-black text-amber-600">' + fmtUsd(v) + ' al cliente</span>' +
                '</button>';
        }

        // No se devolvió nada: el sobrante se queda en la caja, en la moneda por la
        // que entró. Es lo que pasa con los centavos de un pago móvil.
        var selS = !!(vueltoSel && vueltoSel.isSobrante);
        html += '<button type="button" onclick="cobroSelVueltoSobrante()" ' +
            'class="border-2 rounded-xl px-2.5 py-2 text-left transition-colors ' +
            (selS ? 'border-sky-500 bg-sky-100' : 'border-sky-200 bg-white hover:border-sky-400') + '">' +
            '<span class="block text-xs font-bold text-sky-800 leading-tight truncate">No se devolvió</span>' +
            '<span class="block text-[11px] font-black text-sky-600">queda de sobrante</span>' +
            '</button>';

        document.getElementById('cobro-vuelto-btns').innerHTML = html;

        // Banco / referencia solo si el método elegido los exige (pago móvil,
        // transferencia...): ese vuelto sale de una cuenta, no de la gaveta.
        var extra = '';
        if (vueltoSel && vueltoSel.isSobrante) {
            // Se nombran las DOS monedas a propósito: el sobrante queda en la moneda
            // por la que entró el pago (los Bs de un pago móvil siguen siendo Bs), y
            // el monto en $ es solo el equivalente.
            extra = '<div class="mt-2 text-[11px] text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-2 py-1.5">' +
                'No sale dinero de la caja: el sobrante (' + fmtBs(v * TASA) + ' · ' + fmtUsd(v) + ') ' +
                'se queda en la moneda del método por el que entró.</div>';
        } else if (vueltoSel && !vueltoSel.isFavor) {
            var met = metodoById(vueltoSel.metodo_id) || {};
            var lblCls = 'block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1';
            if (met.requiere_banco == 1) {
                if (!BANCOS.length) {
                    extra += '<div class="mt-2 text-[11px] text-amber-700 bg-amber-100 border border-amber-300 rounded-lg px-2 py-1.5">⚠ No hay cuentas bancarias. Configúralas en <b>Finanzas → Cuentas Bancarias</b>.</div>';
                } else if (vueltoSel.bancoFijo) {
                    extra += avisoBancoFijo(vueltoSel.banco_id, 'Sale de');
                } else {
                    var opts = '<option value="">— Banco de donde sale —</option>' + bancosDeMoneda(vueltoSel.esBase).map(function (bk) {
                        return '<option value="' + bk.id + '"' + (vueltoSel.banco_id == bk.id ? ' selected' : '') + '>' +
                               esc(bk.nombre_banco) + ' (' + esc(bk.moneda_codigo) + ')</option>';
                    }).join('');
                    extra += '<div class="mt-2"><label class="' + lblCls + '">Banco de donde sale</label>' +
                        '<select onchange="cobroVueltoSetBanco(this.value)" class="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none">' + opts + '</select></div>';
                }
            }
            if (met.requiere_banco == 1 || met.requiere_referencia == 1) {
                extra += '<div class="mt-2"><label class="' + lblCls + '">Referencia del envío</label>' +
                    '<input type="text" value="' + esc(vueltoSel.referencia || '') + '" oninput="cobroVueltoSetRef(this.value)" ' +
                    'placeholder="Nº de referencia" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"></div>';
            }
        }
        document.getElementById('cobro-vuelto-extra').innerHTML = extra;
    }

    window.cobroSelVuelto = function (metodo_id) {
        var met = metodoById(metodo_id);
        if (!met) return;
        var mon = monedaById[met.moneda_id_default] || {};
        var vEsBase = (mon.es_base == 1);
        vueltoSel = {
            metodo_id:  metodo_id,
            nombre:     met.nombre,
            esBase:     vEsBase,
            moneda_id:  met.moneda_id_default,
            // Misma regla que en el cobro: si el método tiene su cuenta fija,
            // el vuelto sale de ahí sin preguntar.
            banco_id:   bancoDefault(met, vEsBase),
            bancoFijo:  (bancoDefault(met, vEsBase) !== ''),
            referencia: '',
            isFavor:    false
        };
        renderVueltoBox();
        actualizarBotonConfirmar();
    };

    window.cobroSelVueltoFavor = function () {
        if (clienteId <= 0) return;
        vueltoSel = { metodo_id: null, nombre: 'Saldo a favor', esBase: true,
                      moneda_id: null, banco_id: '', referencia: '', isFavor: true };
        renderVueltoBox();
        actualizarBotonConfirmar();
    };

    window.cobroSelVueltoSobrante = function () {
        vueltoSel = { metodo_id: null, nombre: 'Sobrante', esBase: true,
                      moneda_id: null, banco_id: '', referencia: '', isSobrante: true };
        renderVueltoBox();
        actualizarBotonConfirmar();
    };

    // Estos NO re-pintan la caja: el input perdería el foco a cada tecla.
    window.cobroVueltoSetBanco = function (val) {
        if (vueltoSel) vueltoSel.banco_id = val || '';
        actualizarBotonConfirmar();
    };
    window.cobroVueltoSetRef = function (val) {
        if (vueltoSel) vueltoSel.referencia = val;
        actualizarBotonConfirmar();
    };

    // Lo que se eligió, listo para el payload. Los emisores lo leen de aquí en
    // vez de recibirlo por parámetro: así no se pierde en los reintentos con PIN.
    window.tplkVueltoPayload = function () { return window.__tplkVuelto || null; };

    // ============ Confirmar (contrato backend: pagos[] + saldo_favor_aplicado) ============
    window.cobroConfirmar = function () {
        var pagos = [];
        var faltaBanco = false;
        var faltaComp  = '';   // nombre del método sin comprobante (transferencias)
        var ncTotal = 0;
        lineas.forEach(function (l) {
            if (l.isNC) { ncTotal += round2(l.montoUsd); return; }
            var met = metodoById(l.metodo_id);
            if (!met) return;
            var mon = monedaById[met.moneda_id_default] || {};
            var esBase = (mon.es_base == 1);
            var monto_moneda = esBase ? round2(l.montoUsd) : round2(l.montoBs);
            if (monto_moneda <= 0) return;
            var tasa = esBase ? 1 : TASA;
            if (met.requiere_banco == 1 && BANCOS.length && !l.banco_id) faltaBanco = true;
            if (met.instrumento_caja === 'transferencia' && !String(l.comprobante || '').trim()) faltaComp = met.nombre;
            pagos.push({
                metodo_id: l.metodo_id,
                moneda_id: met.moneda_id_default,
                monto_moneda: monto_moneda,
                tasa: tasa,
                referencia: l.referencia || '',
                banco_id: l.banco_id || null,
                comprobante: l.comprobante || ''
            });
        });
        ncTotal = round2(ncTotal);

        if (!pagos.length && ncTotal <= 0) { appAlert('Sin pagos', 'Agrega al menos un pago.', 'warning'); return; }
        if (faltaBanco) { appAlert('Falta banco', 'Selecciona el banco para los pagos electrónicos.', 'warning'); return; }
        if (faltaComp)  { appAlert('Falta el comprobante', 'El pago por "' + faltaComp + '" exige adjuntar el comprobante. Elimina la línea y agrégala de nuevo con el soporte.', 'warning'); return; }

        var pagado = pagadoUsd();
        if (pagado + 0.01 < totalUsd) { appAlert('Pago insuficiente', 'El pago no cubre el total.', 'warning'); return; }

        // Vuelto: es obligatorio decir CÓMO se entrega. Sin esto el arqueo no puede
        // saber de qué gaveta salió el dinero.
        var v = round2(pagado - totalUsd);
        var vueltoPayload = null;
        var vueltoFavor   = false;
        if (v > 0.01) {
            if (!vueltoCompleto()) {
                var met = vueltoSel ? metodoById(vueltoSel.metodo_id) : null;
                appAlert('Falta indicar el vuelto',
                    !vueltoSel ? 'Indica cómo se le entrega el vuelto de ' + fmtUsd(v) + ' al cliente.'
                               : 'Completa el banco y la referencia del vuelto por "' + ((met && met.nombre) || '') + '".',
                    'warning');
                return;
            }
            if (vueltoSel.isSobrante) {
                // No se registra vuelto: el excedente se queda donde entró.
                vueltoPayload = { sobrante: true, monto_usd: v };
            } else if (vueltoSel.isFavor) {
                vueltoFavor   = true;
                vueltoPayload = { a_favor: true, monto_usd: v };
            } else {
                vueltoPayload = {
                    a_favor:      false,
                    metodo_id:    vueltoSel.metodo_id,
                    moneda_id:    vueltoSel.moneda_id,
                    monto_moneda: vueltoSel.esBase ? v : round2(v * TASA),
                    monto_usd:    v,
                    tasa:         vueltoSel.esBase ? 1 : TASA,
                    banco_id:     vueltoSel.banco_id || null,
                    referencia:   vueltoSel.referencia || ''
                };
            }
        }
        window.__tplkVuelto = vueltoPayload;

        cerrarModalCobro();
        if (typeof onConfirmCb === 'function') {
            onConfirmCb(pagos, {
                total_usd: totalUsd,
                pagado_usd: pagado,
                vuelto_usd: v,
                saldo_favor_aplicado: ncTotal,
                vuelto_a_favor: vueltoFavor,
                vuelto: vueltoPayload
            });
        }
    };

    // ============ Teclado: 1-9 método · ENTER agrega/confirma · ESC vuelve ============
    document.addEventListener('keydown', function (e) {
        if (modal.classList.contains('hidden')) return;
        var ae = document.activeElement;
        var inField = ae && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT' || ae.tagName === 'TEXTAREA');

        if (e.key === 'Escape') {
            e.preventDefault();
            if (entry) cobroEntryCancelar(); else cerrarModalCobro();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (entry) { cobroEntryAgregar(); }
            else if (!document.getElementById('cobro-confirmar').disabled) { cobroConfirmar(); }
            return;
        }
        if (!entry && !inField && /^[1-9]$/.test(e.key)) {
            var idx = parseInt(e.key, 10) - 1;
            if (idx < METODOS.length) { e.preventDefault(); cobroSelMetodo(METODOS[idx].id); }
            else if (ncVisible() && idx === METODOS.length) { e.preventDefault(); cobroSelNC(); }
        }
    });
})();
3. MODAL DE REEMBOLSO (tplk-modal-reembolso)
javascript
(function () {
    if (window.__tplkReembInit) return;
    window.__tplkReembInit = true;

    var modal   = document.getElementById('tplk-modal-reembolso');
    var elLin   = document.getElementById('reem-lineas');
    var elVacio = document.getElementById('reem-vacio');
    var elObj   = document.getElementById('reem-objetivo');
    var elRep   = document.getElementById('reem-repartido');
    var elRest  = document.getElementById('reem-restante');
    var elAviso = document.getElementById('reem-aviso');
    var elBtn   = document.getElementById('reem-confirmar');
    var elCli   = document.getElementById('reem-cliente');

    var opts = {}, lineas = [], objetivo = 0, cb = null;

    function round2(n) { return Math.round((parseFloat(n) || 0) * 100) / 100; }
    function fmtUsd(n) { return '$' + (parseFloat(n) || 0).toFixed(2); }
    function fmtBs(n)  { return 'Bs ' + (parseFloat(n) || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').replace(/,/g, '@').replace(/\./g, ',').replace(/@/g, '.'); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function fmtMon(l, n) { return l.es_base ? fmtUsd(n) : fmtBs(n); }

    // Tasa efectiva de una línea según el modo elegido por el cajero.
    function tasaDe(l) {
        if (l.es_base) return 1;
        return (l.tasa_modo === 'hoy') ? (parseFloat(opts.tasaHoy) || 1) : (parseFloat(l.tasa_original) || 1);
    }
    function usdDe(l) {
        var t = tasaDe(l);
        return round2((parseFloat(l.monto_moneda) || 0) / (t > 0 ? t : 1));
    }

    modal.addEventListener('click', cerrar);

    function pintar() {
        if (!lineas.length) {
            elLin.innerHTML = '';
            elVacio.classList.remove('hidden');
        } else {
            elVacio.classList.add('hidden');
            elLin.innerHTML = lineas.map(function (l, i) {
                var excede = (l.disponible_moneda !== null && l.disponible_moneda !== undefined)
                          && ((parseFloat(l.monto_moneda) || 0) > (parseFloat(l.disponible_moneda) || 0) + 0.01);
                var tope = (l.disponible_moneda === null || l.disponible_moneda === undefined)
                    ? 'Sin registro de pago'
                    : ('Máx ' + fmtMon(l, l.disponible_moneda));
                return '' +
                '<div class="rounded-xl border ' + (excede ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white') + ' p-3">' +
                  '<div class="flex items-center justify-between gap-2 mb-2">' +
                    '<div class="min-w-0">' +
                      '<div class="text-sm font-bold text-gray-800 truncate">' + esc(l.nombre) + '</div>' +
                      '<div class="text-[10px] font-semibold ' + (excede ? 'text-amber-700' : 'text-gray-400') + '">' + tope + '</div>' +
                    '</div>' +
                    '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded ' + (l.es_base ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600') + '">' + (l.es_base ? 'USD' : 'Bs') + '</span>' +
                  '</div>' +
                  '<div class="flex items-center gap-2 flex-wrap">' +
                    '<input type="number" step="0.01" min="0" value="' + (parseFloat(l.monto_moneda) || 0).toFixed(2) + '" data-i="' + i + '" ' +
                      'class="reem-in flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-right focus:border-brand-500 outline-none">' +
                    (l.es_base ? '' :
                      '<select data-t="' + i + '" class="reem-tasa border border-gray-300 rounded-lg px-2 py-2 text-xs font-semibold bg-white focus:border-brand-500 outline-none">' +
                        '<option value="original"' + (l.tasa_modo !== 'hoy' ? ' selected' : '') + '>Mismos Bs que pagó</option>' +
                        '<option value="hoy"' + (l.tasa_modo === 'hoy' ? ' selected' : '') + '>Tasa de hoy</option>' +
                      '</select>') +
                    '<span class="text-xs font-bold text-gray-500 w-20 text-right">' + fmtUsd(usdDe(l)) + '</span>' +
                    (l.es_billetera ? '' : '<button type="button" data-x="' + i + '" class="reem-del p-1 text-gray-300 hover:text-red-500">&times;</button>') +
                  '</div>' +
                  (l.es_base ? '' : '<div class="text-[10px] text-gray-400 mt-1">Tasa ' + (tasaDe(l)).toFixed(2) + (l.tasa_modo === 'hoy' ? ' (hoy)' : ' (la del cobro)') + '</div>') +
                '</div>';
            }).join('');

            Array.prototype.forEach.call(elLin.querySelectorAll('.reem-in'), function (inp) {
                inp.addEventListener('input', function () {
                    lineas[parseInt(inp.dataset.i, 10)].monto_moneda = round2(inp.value);
                    totales();
                });
                inp.addEventListener('change', pintar);
            });
            Array.prototype.forEach.call(elLin.querySelectorAll('.reem-tasa'), function (sel) {
                sel.addEventListener('change', function () {
                    lineas[parseInt(sel.dataset.t, 10)].tasa_modo = sel.value;
                    pintar();
                });
            });
            Array.prototype.forEach.call(elLin.querySelectorAll('.reem-del'), function (b) {
                b.addEventListener('click', function () {
                    lineas.splice(parseInt(b.dataset.x, 10), 1);
                    pintar();
                });
            });
        }
        totales();
    }

    function totales() {
        var rep = 0, fuera = false;
        lineas.forEach(function (l) {
            rep += usdDe(l);
            if (l.disponible_moneda !== null && l.disponible_moneda !== undefined
                && (parseFloat(l.monto_moneda) || 0) > (parseFloat(l.disponible_moneda) || 0) + 0.01) fuera = true;
            if (l.disponible_moneda === null || l.disponible_moneda === undefined) fuera = true;
        });
        rep = round2(rep);
        var falta = round2(objetivo - rep);

        elObj.textContent = fmtUsd(objetivo);
        elRep.textContent = fmtUsd(rep);
        elRest.textContent = fmtUsd(falta);
        elRest.className = 'font-black ' + (Math.abs(falta) < 0.021 ? 'text-emerald-600' : (falta > 0 ? 'text-amber-600' : 'text-red-600'));

        if (fuera) {
            elAviso.textContent = 'Hay líneas por encima de lo que el cliente pagó por ese método. Se pedirá el PIN de un supervisor.';
            elAviso.classList.remove('hidden');
        } else {
            elAviso.classList.add('hidden');
        }
        elBtn.disabled = !lineas.length || Math.abs(falta) > 0.021;
        window.__reemFuera = fuera;
    }

    window.reemRestaurar = function () {
        lineas = (opts.metodos || []).filter(function (m) {
            return (parseFloat(m.sugerido_moneda) || 0) > 0.005;
        }).map(function (m) {
            return {
                metodo_id: m.metodo_id, nombre: m.nombre, es_base: !!m.es_base,
                moneda_id: m.moneda_id, tasa_original: m.tasa_original,
                disponible_moneda: m.disponible_moneda,
                monto_moneda: round2(m.sugerido_moneda), tasa_modo: 'original',
                requiere_banco: m.requiere_banco, banco_id: m.banco_id || null,
                referencia: '', es_billetera: false
            };
        });
        pintar();
    };

    window.reemConfirmar = function () {
        var pagos = lineas.filter(function (l) { return (parseFloat(l.monto_moneda) || 0) > 0.005; })
            .map(function (l) {
                return {
                    metodo_id: l.es_billetera ? null : l.metodo_id,
                    moneda_id: l.moneda_id,
                    monto_moneda: round2(l.monto_moneda),
                    tasa_modo: l.es_base ? 'original' : (l.tasa_modo || 'original'),
                    referencia: l.referencia || '',
                    banco_id: l.banco_id || null,
                    es_billetera: !!l.es_billetera
                };
            });
        var rep = 0; lineas.forEach(function (l) { rep += usdDe(l); });
        cerrar();
        if (typeof cb === 'function') {
            cb(pagos, { objetivo_usd: objetivo, repartido_usd: round2(rep), hay_fuera_de_tope: !!window.__reemFuera });
        }
    };

    function abrir(objetivoUsd, opciones) {
        opts = opciones || {};
        cb   = opts.onConfirm || null;
        objetivo = round2(objetivoUsd);
        elCli.textContent = opts.clienteNombre ? ('· ' + opts.clienteNombre) : '';
        if (opts.confirmLabel) elBtn.textContent = opts.confirmLabel;

        // Si ya venía un reparto editado, se respeta; si no, el sugerido.
        if (Array.isArray(opts.lineasActuales) && opts.lineasActuales.length) {
            lineas = opts.lineasActuales.map(function (l) { return Object.assign({}, l); });
            pintar();
        } else {
            window.reemRestaurar();
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function cerrar() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    document.addEventListener('keydown', function (e) {
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    });

    window.abrirModalReembolso  = abrir;
    window.cerrarModalReembolso = cerrar;
})();
4. MODAL DE CLIENTES (tplk-modal-cliente)
javascript
// ============================================================
// Validación de clientes — GLOBAL (espejo de clientes_func.php).
// Se define aquí porque este componente se incluye una sola vez
// en panel.php, así todas las vistas de la SPA pueden usarla.
// El servidor SIEMPRE re-valida; esto es solo para avisar antes.
// ============================================================
window.cliSoloDigitos = function (t) { return String(t == null ? '' : t).replace(/\D+/g, ''); };

window.cliEsGenerico = function (nombre) {
    var n = String(nombre || '').toUpperCase().replace(/\s+/g, ' ').trim();
    return n === 'CLIENTE MOSTRADOR' || n === 'CONTADO' || n === 'CLIENTE CONTADO';
};

/** Devuelve un texto de error, o null si los datos son válidos.
 *  'direccion' es opcional: pásala solo al CREAR para exigirla; al editar
 *  no se envía (undefined) y no se valida. */
window.cliValidarCliente = function (nombre, rif, telefono, canal, direccion) {
    nombre = String(nombre || '').trim();
    if (!nombre) return 'El nombre es obligatorio.';
    if (nombre.length < 4) return 'El nombre es demasiado corto.';

    if (window.cliEsGenerico(nombre)) return null;

    if (canal !== 'mayor' && canal !== 'corporativo') {
        var palabras = nombre.split(/\s+/).filter(function (p) { return p.length >= 2; });
        if (palabras.length < 2) return 'Escribe nombre Y apellido del cliente (ej: JUAN PÉREZ).';
    }

    var ced = window.cliSoloDigitos(rif);
    if (!ced)          return 'La cédula / RIF es obligatoria.';
    if (ced.length < 6)  return 'La cédula / RIF no es válida (mínimo 6 dígitos).';
    if (ced.length > 12) return 'La cédula / RIF no es válida (demasiados dígitos).';

    var tel = window.cliSoloDigitos(telefono);
    if (!tel)           return 'El teléfono es obligatorio.';
    if (tel.length < 10)  return 'El teléfono no es válido (ej: 0414-1234567).';
    if (tel.length > 15)  return 'El teléfono no es válido (demasiados dígitos).';

    if (direccion !== undefined && direccion !== null) {
        var dir = String(direccion).trim();
        if (!dir)          return 'La dirección es obligatoria.';
        if (dir.length < 5)  return 'La dirección es demasiado corta.';
    }

    return null;
};

(function () {
    if (window.__tplkBuscadorClientesInit) return;
    window.__tplkBuscadorClientesInit = true;

    var CACHE = null, cargando = false, resultados = [], indice = -1, onSelectCb = null, opts = {}, guardando = false, abiertoTs = 0;
    var CACHE_TS = 0, TTL_MS = 60000;   // caché fresco 60s; luego se refresca solo (sin F5)

    var modal    = document.getElementById('tplk-modal-cliente');
    var input    = document.getElementById('tplk-modal-cliente-input');
    var lista    = document.getElementById('tplk-modal-cliente-lista');
    var titulo   = document.getElementById('tplk-modal-cliente-titulo');
    var contador = document.getElementById('tplk-modal-cliente-contador');
    var panelNuevo = document.getElementById('tplk-modal-cliente-nuevo');

    // Teclado del modal (solo cuando está abierto):
    //   Esc → cerrar · F3 → abrir "Nuevo cliente".
    document.addEventListener('keydown', function (e) {
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
        else if (e.key === 'F3') {
            e.preventDefault();
            // Ignora el MISMO F3 que abrió el modal (orden de listeners en carga directa).
            if (Date.now() - abiertoTs < 300) return;
            toggleNuevo(true);
        }
    });

    // Enter en CUALQUIER campo del formulario "Nuevo" → Guardar y usar (sin click).
    ['tplk-cli-nombre', 'tplk-cli-rif', 'tplk-cli-tel', 'tplk-cli-direccion'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); guardarNuevo(); }
        });
    });

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function render() {
        if (!resultados.length) {
            lista.innerHTML = '<div class="px-6 py-10 text-center text-sm text-gray-400">Sin resultados. Usa “Nuevo” para crearlo.</div>';
            contador.textContent = '0 clientes';
            return;
        }
        var html = '';
        resultados.forEach(function (c, i) {
            var activo = (i === indice);
            html += '' +
              '<div class="tplk-fila-cli flex items-center justify-between gap-4 px-5 py-3.5 cursor-pointer transition-colors ' +
                   (activo ? 'bg-brand-50 border-l-4 border-brand-500' : 'hover:bg-gray-50 border-l-4 border-transparent') +
                   '" data-idx="' + i + '">' +
                '<div class="min-w-0 flex-1">' +
                  '<div class="text-sm md:text-base font-semibold text-gray-800 truncate">' + escapeHtml(c.nombre) + '</div>' +
                  '<div class="text-xs text-gray-400 mt-0.5">' + escapeHtml(c.identificacion || 'Sin RIF/Cédula') + '</div>' +
                '</div>' +
                (parseInt(c.bloqueado) === 1
                    ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 flex-shrink-0">Bloqueado crédito</span>'
                    : '<span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0 capitalize">' + escapeHtml(c.canal || 'detal') + '</span>') +
              '</div>';
        });
        lista.innerHTML = html;
        contador.textContent = resultados.length + ' cliente' + (resultados.length === 1 ? '' : 's');

        Array.prototype.forEach.call(lista.querySelectorAll('.tplk-fila-cli'), function (el) {
            el.addEventListener('mouseenter', function () { indice = parseInt(el.dataset.idx, 10); marcar(); });
            el.addEventListener('click', function () { elegir(parseInt(el.dataset.idx, 10)); });
        });
        marcar();
    }

    function marcar() {
        var filas = lista.querySelectorAll('.tplk-fila-cli');
        Array.prototype.forEach.call(filas, function (el, i) {
            el.classList.toggle('bg-brand-50', i === indice);
            if (i === indice) el.scrollIntoView({ block: 'nearest' });
        });
    }

    function filtrar() {
        var q = input.value.trim().toLowerCase();
        var base = (CACHE || []);
        if (!q) {
            resultados = base.slice(0, 100);
        } else {
            resultados = base.filter(function (c) {
                return (c.nombre && c.nombre.toLowerCase().indexOf(q) !== -1) ||
                       (c.identificacion && c.identificacion.toLowerCase().indexOf(q) !== -1);
            }).slice(0, 100);
        }
        indice = resultados.length ? 0 : -1;
        render();
    }

    function elegir(i) {
        if (i < 0 || i >= resultados.length) return;
        var cli = resultados[i];
        cerrar();
        if (typeof onSelectCb === 'function') onSelectCb(cli);
    }

    function cargar() {
        lista.innerHTML = '<div class="px-6 py-10 flex flex-col items-center gap-3 text-gray-400">' +
            '<div class="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>' +
            '<span class="text-sm">Cargando clientes...</span></div>';
        cargando = true;
        fetch('modulos/ventas/api_buscar_clientes.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                cargando = false;
                CACHE = (d && d.success) ? (d.clientes || []) : [];
                CACHE_TS = Date.now();
                filtrar();
            })
            .catch(function () {
                cargando = false;
                lista.innerHTML = '<div class="px-6 py-10 text-center text-sm text-red-500">Error al cargar clientes.</div>';
            });
    }

    // Refresca por detrás para reflejar clientes creados/editados por otros usuarios.
    function refrescarSilencioso() {
        if (cargando) return;
        cargando = true;
        fetch('modulos/ventas/api_buscar_clientes.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                cargando = false;
                if (d && d.success) {
                    CACHE = d.clientes || []; CACHE_TS = Date.now();
                    if (!modal.classList.contains('hidden')) filtrar();
                }
            })
            .catch(function () { cargando = false; });
    }

    input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (resultados.length) { indice = (indice + 1) % resultados.length; marcar(); } }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (resultados.length) { indice = (indice - 1 + resultados.length) % resultados.length; marcar(); } }
        else if (e.key === 'Enter') { e.preventDefault(); elegir(indice); }
        else if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    });
    input.addEventListener('input', filtrar);

    function toggleNuevo(show) {
        panelNuevo.classList.toggle('hidden', !show);
        if (show) {
            document.getElementById('tplk-cli-nombre').value = input.value.trim();
            document.getElementById('tplk-cli-rif').value = '';
            document.getElementById('tplk-cli-tel').value = '';
            document.getElementById('tplk-cli-direccion').value = '';
            setTimeout(function () { document.getElementById('tplk-cli-nombre').focus(); }, 30);
        }
    }

    function guardarNuevo() {
        if (guardando) return;
        var nombre = document.getElementById('tplk-cli-nombre').value.trim();
        var rifVal = document.getElementById('tplk-cli-rif').value.trim();
        var telVal = document.getElementById('tplk-cli-tel').value.trim();
        var dirVal = document.getElementById('tplk-cli-direccion').value.trim();

        var err = window.cliValidarCliente(nombre, rifVal, telVal, 'detal', dirVal);
        if (err) {
            if (window.appAlert) appAlert('Faltan datos del cliente', err, 'warning');
            else if (window.appToast) appToast(err, 'warning');
            return;
        }
        guardando = true;
        var btn = document.getElementById('tplk-cli-guardar');
        btn.disabled = true; btn.textContent = 'Guardando...';
        fetch('modulos/ventas/guardar_cliente_rapido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                rif_cedula: rifVal,
                telefono: telVal,
                direccion: dirVal,
                canal: 'detal'
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
            guardando = false;
            btn.disabled = false; btn.textContent = 'Guardar y usar';
            if (!d || !d.ok) { if (window.appAlert) appAlert('No se pudo crear', (d && d.error) || '', 'error'); return; }
            var nuevo = {
                id: d.id, nombre: nombre,
                identificacion: rifVal, telefono: telVal, direccion: dirVal,
                canal: 'detal', bloqueado: 0, dias_credito: 0, saldo_favor: 0
            };
            if (CACHE) CACHE.unshift(nuevo);
            cerrar();
            if (typeof onSelectCb === 'function') onSelectCb(nuevo);
        })
        .catch(function () {
            guardando = false;
            btn.disabled = false; btn.textContent = 'Guardar y usar';
            if (window.appAlert) appAlert('Error', 'No se pudo crear el cliente.', 'error');
        });
    }

    function abrir(onSelect, opciones) {
        abiertoTs = Date.now();
        onSelectCb = onSelect;
        opts = opciones || {};
        titulo.textContent = opts.titulo || 'Seleccionar Cliente';
        input.value = '';
        indice = -1; resultados = [];
        panelNuevo.classList.add('hidden');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(function () { input.focus(); }, 30);
        if (CACHE === null && !cargando) cargar();
        else if (!cargando) {
            filtrar();
            if (Date.now() - CACHE_TS > TTL_MS) refrescarSilencioso();
        }
    }

    function cerrar() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        panelNuevo.classList.add('hidden');
    }

    window.abrirBuscadorClientes  = abrir;
    window.cerrarBuscadorClientes = cerrar;
    window.tplkClienteToggleNuevo = toggleNuevo;
    window.tplkClienteGuardarNuevo = guardarNuevo;
})();
5. MODAL DE ITEM (tplk-modal-item) - Cantidad / Precio
javascript
(function () {
    if (window.__tplkModalItemInit) return;
    window.__tplkModalItemInit = true;

    var modal   = document.getElementById('tplk-modal-item');
    var titulo  = document.getElementById('tplk-item-titulo');
    var sub     = document.getElementById('tplk-item-sub');
    var boxCant = document.getElementById('tplk-item-cant');
    var boxPrec = document.getElementById('tplk-item-precio');
    var inCant  = document.getElementById('tplk-item-cant-input');
    var inUsd   = document.getElementById('tplk-item-usd');
    var inBs    = document.getElementById('tplk-item-bs');
    var tasaLbl = document.getElementById('tplk-item-tasa-lbl');
    var btnExtra = document.getElementById('tplk-item-extra');
    var avisoMin = document.getElementById('tplk-item-min-aviso');

    var modo = null, cb = null, maxCant = Infinity, tasa = 0, minPrecio = 0, extraCb = null;
    var minSuave = false, minTexto = '';

    // Pinta (o esconde) el aviso de "por debajo del mínimo". Solo aplica al
    // mínimo suave: con el mínimo duro el confirmar se bloquea y no hace falta.
    function pintarAvisoMin() {
        if (!avisoMin) return;
        var bajo = (modo === 'precio' && minSuave && minPrecio > 0 &&
                    round2(num(inUsd.value)) < round2(minPrecio));
        if (bajo) {
            avisoMin.textContent = minTexto || ('⚠️ Por debajo de $' + minPrecio.toFixed(2) + ': requerirá autorización.');
            avisoMin.classList.remove('hidden');
            inUsd.classList.add('border-rose-400');
            inUsd.classList.remove('border-brand-300');
        } else {
            avisoMin.classList.add('hidden');
            inUsd.classList.remove('border-rose-400');
            inUsd.classList.add('border-brand-300');
        }
    }

    // Cerrar SOLO con Esc o el botón Cancelar (no al hacer click fuera).
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.preventDefault(); cerrar(); }
    });

    function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }

    function abrirCantidad(o) {
        o = o || {};
        modo = 'cantidad'; cb = o.onConfirm; maxCant = o.max != null ? num(o.max) : Infinity;
        titulo.textContent = o.titulo || 'Cantidad';
        sub.textContent = o.max != null ? ('Stock disponible: ' + num(o.max)) : '';
        boxPrec.classList.add('hidden'); boxCant.classList.remove('hidden');
        inCant.value = o.valor != null ? o.valor : 1;
        show(); setTimeout(function () { inCant.focus(); inCant.select(); }, 30);
    }

    function abrirPrecio(o) {
        o = o || {};
        modo = 'precio'; cb = o.onConfirm; tasa = num(o.tasa); minPrecio = num(o.min);
        minSuave = !!o.minSuave; minTexto = o.minTexto || '';
        titulo.textContent = o.titulo || 'Cambiar precio';
        sub.textContent = o.subtitulo || '';
        boxCant.classList.add('hidden'); boxPrec.classList.remove('hidden');
        var usd = num(o.usd);
        inUsd.value = usd.toFixed(2);
        inBs.value = (usd * tasa).toFixed(2);
        tasaLbl.textContent = tasa > 0 ? ('Tasa ' + tasa.toFixed(2).replace('.', ',') + ' — escribe en $ o Bs, el otro se calcula') : '';
        // Botón extra opcional (ej. "Mostrar todos los productos" en la Nota de Entrega).
        if (btnExtra) {
            if (o.extraBtn && o.extraBtn.label && typeof o.extraBtn.onClick === 'function') {
                btnExtra.textContent = o.extraBtn.label;
                btnExtra.classList.remove('hidden');
                extraCb = o.extraBtn.onClick;
            } else {
                btnExtra.classList.add('hidden');
                extraCb = null;
            }
        }
        pintarAvisoMin();
        show(); setTimeout(function () { inUsd.focus(); inUsd.select(); }, 30);
    }

    // Auto-conversión $ <-> Bs
    inUsd.addEventListener('input', function () { if (tasa > 0) inBs.value = (num(inUsd.value) * tasa).toFixed(2); pintarAvisoMin(); });
    inBs.addEventListener('input', function () { if (tasa > 0) inUsd.value = (num(inBs.value) / tasa).toFixed(2); pintarAvisoMin(); });

    function confirmar() {
        if (modo === 'cantidad') {
            var c = parseInt(inCant.value, 10) || 0;
            if (c <= 0) { if (window.appToast) appToast('Cantidad inválida', 'warning'); return; }
            if (c > maxCant) c = maxCant;
            var f = cb; cerrar(); if (typeof f === 'function') f(c);
        } else if (modo === 'precio') {
            var u = num(inUsd.value);
            if (u <= 0) { if (window.appToast) appToast('Precio inválido', 'warning'); return; }
            // No se cierra el modal: se avisa y se deja corregir en el sitio.
            // Con mínimo SUAVE no se frena: el aviso rojo ya advirtió y el
            // servidor pedirá la autorización de gerencia al emitir.
            if (!minSuave && minPrecio > 0 && round2(u) < round2(minPrecio)) {
                if (window.appToast) appToast('El precio no puede ser menor a $' + minPrecio.toFixed(2), 'warning');
                inUsd.focus(); inUsd.select();
                return;
            }
            var f2 = cb; cerrar(); if (typeof f2 === 'function') f2(round2(u));
        }
    }

    function round2(n) { return Math.round((num(n) + Number.EPSILON) * 100) / 100; }

    function onKey(e) {
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Enter') { e.preventDefault(); confirmar(); }
        else if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    }
    inCant.addEventListener('keydown', onKey);
    inUsd.addEventListener('keydown', onKey);
    inBs.addEventListener('keydown', onKey);

    // Botón extra: cierra el modal y ejecuta su callback (ej. abrir el selector de todos
    // los productos). Se resetea en cada cierre para no filtrarse a otros usos del modal.
    function tplkItemExtra() { var f = extraCb; cerrar(); if (typeof f === 'function') f(); }

    function show() { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    function cerrar() {
        modal.classList.add('hidden'); modal.classList.remove('flex');
        modo = null; cb = null; extraCb = null;
        minSuave = false; minTexto = ''; minPrecio = 0;
        if (avisoMin) avisoMin.classList.add('hidden');
        inUsd.classList.remove('border-rose-400');
        inUsd.classList.add('border-brand-300');
        if (btnExtra) btnExtra.classList.add('hidden');
    }

    window.abrirModalCantidad = abrirCantidad;
    window.abrirModalPrecio   = abrirPrecio;
    window.tplkItemConfirmar  = confirmar;
    window.tplkItemCerrar     = cerrar;
    window.tplkItemExtra      = tplkItemExtra;
})();
6. MODAL CONSULTOR DE PRECIOS (tplk-modal-consultor)
javascript
(function () {
    if (window.__tplkConsultorInit) return;
    window.__tplkConsultorInit = true;

    var BCV   = 804.81;
    var PAR   = 990;
    var CANAL = "todos";

    var TIENDA_LBL = { detal: 'Tienda Detal', mayor: 'Tienda Mayor', corporativo: 'Tienda Corporativo', todos: 'Todos los precios' };

    var CACHE = null, cargando = false;
    var CACHE_TS = 0, TTL_MS = 60000;   // caché fresco 60s; luego se refresca solo
    var lista = [], idx = -1, seleccionado = null;
    var modal  = document.getElementById('tplk-modal-consultor');
    var input  = document.getElementById('tplk-consultor-input');
    var listEl = document.getElementById('tplk-consultor-list');
    var result = document.getElementById('tplk-consultor-result');
    document.getElementById('tplk-cp-tienda').textContent = TIENDA_LBL[CANAL] || TIENDA_LBL.todos;

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function num(n) { return (parseFloat(n) || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); }
    function fmtUsd(n) { return '$' + num(n); }
    function fmtBs(n, kind) { return 'Bs ' + num((parseFloat(n) || 0) * (kind === 'bcv' ? BCV : PAR)); }

    // Filas de precio a mostrar según el TIPO DE TIENDA (canal_venta).
    function filasPrecio(p) {
        var P2 = (p.precio_detal_usd != null) ? p.precio_detal_usd : p.precio_detal; // base real (divisa)
        var P3 = (p.precio_detal != null) ? p.precio_detal : p.precio;               // detal BCV (inflado)
        if (CANAL === 'detal') {
            return [
                { l: 'Detal BCV', v: P3, k: 'bcv', main: true },
                { l: 'Detal $ (divisa)', v: P2, k: 'par' }
            ];
        }
        if (CANAL === 'mayor') {
            return [
                { l: 'Mayor', v: p.precio_mayor, k: 'par', main: true },
                { l: 'Instalador', v: p.precio_instalador, k: 'par' }
            ];
        }
        if (CANAL === 'corporativo') {
            return [
                { l: 'Corporativo', v: p.precio_corporativo, k: 'par', main: true },
                { l: 'Mayor', v: p.precio_mayor, k: 'par' }
            ];
        }
        // todos / admin
        return [
            { l: 'Mayor', v: p.precio_mayor, k: 'par', main: true },
            { l: 'Detal $', v: P2, k: 'par' },
            { l: 'Detal BCV', v: P3, k: 'bcv' },
            { l: 'Corporativo', v: p.precio_corporativo, k: 'par' },
            { l: 'Instalador', v: p.precio_instalador, k: 'par' }
        ];
    }

    function renderLista() {
        result.innerHTML = '';
        if (!lista.length) {
            listEl.innerHTML = input.value.trim()
                ? '<div class="text-center text-sm text-gray-400 py-4">Sin resultados.</div>' : '';
            return;
        }
        listEl.innerHTML = lista.map(function (p, i) {
            var f = filasPrecio(p)[0] || { v: p.precio_detal, k: 'bcv' };
            var stock = parseFloat(p.stock) || 0;
            return '<button type="button" data-i="' + i + '" onclick="window.__cpSel(' + i + ')" ' +
                'class="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ' +
                (i === idx ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'hover:bg-gray-50') + '">' +
                '<div class="min-w-0"><div class="font-bold text-gray-800 text-sm truncate">' + escapeHtml(p.nombre) + '</div>' +
                '<div class="text-[11px] text-gray-400 font-mono">' + escapeHtml(p.codigo_barra || p.codigo || '—') +
                ' · Stock ' + stock.toFixed(0) + '</div></div>' +
                '<div class="text-right flex-shrink-0"><div class="font-black text-emerald-600 text-sm">' + fmtUsd(f.v) + '</div>' +
                '<div class="text-[10px] text-gray-500">' + fmtBs(f.v, f.k) + '</div></div></button>';
        }).join('');
        marcar();
    }

    function marcar() {
        var btns = listEl.querySelectorAll('[data-i]');
        btns.forEach(function (b, i) {
            b.classList.toggle('bg-emerald-50', i === idx);
            b.classList.toggle('ring-1', i === idx);
            b.classList.toggle('ring-emerald-300', i === idx);
        });
        if (btns[idx]) btns[idx].scrollIntoView({ block: 'nearest' });
    }

    function pintarDetalle(p) {
        if (!p) { result.innerHTML = ''; return; }
        var stock = parseFloat(p.stock) || 0;
        var stockColor = stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50';
        var filas = filasPrecio(p).filter(function (r) { return parseFloat(r.v) > 0 || r.main; });
        var rowsHtml = filas.map(function (r) {
            return '<div class="flex items-center justify-between py-1.5 ' + (r.main ? '' : 'border-t border-emerald-100') + '">' +
                   '<span class="text-xs ' + (r.main ? 'font-bold text-gray-700' : 'text-gray-500') + '">' + r.l + '</span>' +
                   '<span class="text-right"><span class="font-mono font-bold ' + (r.main ? 'text-emerald-600 text-lg' : 'text-gray-700 text-sm') + '">' + fmtUsd(r.v) + '</span>' +
                   '<span class="text-[11px] text-gray-500 ml-2">' + fmtBs(r.v, r.k) + '</span></span></div>';
        }).join('');
        result.innerHTML =
            '<div class="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50/40">' +
              '<div class="flex items-start justify-between gap-2">' +
                '<div class="min-w-0"><div class="font-bold text-gray-800 text-base">' + escapeHtml(p.nombre) + '</div>' +
                '<div class="text-xs text-gray-400 font-mono mt-0.5">' + escapeHtml(p.codigo_barra || p.codigo || 'Sin código') + '</div></div>' +
                '<span class="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ' + stockColor + '">Stock: ' + stock.toFixed(0) + '</span>' +
              '</div>' +
              '<div class="mt-3 pt-2 border-t border-emerald-200">' + rowsHtml + '</div>' +
              '<div class="mt-2 text-[10px] text-gray-400 text-right">Tasas — BCV: ' + num(BCV) + ' · Paralela: ' + num(PAR) + ' Bs/$</div>' +
            '</div>';
    }

    function filtrar() {
        var q = input.value.trim().toLowerCase();
        seleccionado = null;
        if (!q) { lista = []; idx = -1; renderLista(); return; }
        var base = CACHE || [];
        lista = base.filter(function (x) {
            return (x.nombre && x.nombre.toLowerCase().indexOf(q) !== -1) ||
                   (x.codigo && x.codigo.toLowerCase().indexOf(q) !== -1) ||
                   (x.codigo_barra && x.codigo_barra.toLowerCase().indexOf(q) !== -1);
        }).slice(0, 20);
        // Código de barras exacto → seleccionar directo.
        var exacto = base.find(function (x) { return x.codigo_barra && x.codigo_barra.toLowerCase() === q; });
        if (exacto) { lista = [exacto]; idx = 0; renderLista(); seleccionar(0); return; }
        idx = lista.length ? 0 : -1;
        renderLista();
    }

    function seleccionar(i) {
        if (i < 0 || i >= lista.length) return;
        idx = i; seleccionado = lista[i];
        marcar();
        pintarDetalle(seleccionado);
    }
    window.__cpSel = seleccionar;

    function cargar(cb) {
        if (CACHE !== null) { cb && cb(); return; }
        cargando = true;
        listEl.innerHTML = '<div class="text-center text-sm text-gray-400 py-4">Cargando catálogo...</div>';
        fetch('modulos/inventario/api_buscar_productos.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) { cargando = false; CACHE = (d && d.success) ? (d.productos || []) : []; CACHE_TS = Date.now(); listEl.innerHTML = ''; cb && cb(); })
            .catch(function () { cargando = false; listEl.innerHTML = '<div class="text-center text-sm text-red-500 py-4">Error al cargar.</div>'; });
    }

    // Trae la versión nueva por detrás (cambios de otros usuarios) sin cortar el uso.
    function refrescarSilencioso() {
        if (cargando) return;
        cargando = true;
        fetch('modulos/inventario/api_buscar_productos.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                cargando = false;
                if (d && d.success) {
                    CACHE = d.productos || []; CACHE_TS = Date.now();
                    if (!modal.classList.contains('hidden') && input.value.trim()) filtrar();
                }
            })
            .catch(function () { cargando = false; });
    }

    input.addEventListener('input', function () { if (CACHE) filtrar(); });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (lista.length) { idx = Math.min(idx + 1, lista.length - 1); marcar(); seleccionar(idx); } }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (lista.length) { idx = Math.max(idx - 1, 0); marcar(); seleccionar(idx); } }
        else if (e.key === 'Enter') { e.preventDefault(); if (idx >= 0) seleccionar(idx); else if (CACHE) filtrar(); }
        else if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.preventDefault(); cerrar(); }
    });

    function abrir() {
        input.value = ''; listEl.innerHTML = ''; result.innerHTML = ''; lista = []; idx = -1; seleccionado = null;
        modal.classList.remove('hidden'); modal.classList.add('flex');
        setTimeout(function () { input.focus(); }, 30);
        if (CACHE === null && !cargando) cargar();
        else if (CACHE !== null && Date.now() - CACHE_TS > TTL_MS) refrescarSilencioso();
    }
    function cerrar() { modal.classList.add('hidden'); modal.classList.remove('flex'); }

    window.abrirConsultorPrecio  = abrir;
    window.cerrarConsultorPrecio = cerrar;
})();
7. MODAL RECUPERAR VENTA (tplk-modal-recuperar)
javascript
(function () {
    if (window.__tplkRecuperarInit) return;
    window.__tplkRecuperarInit = true;

    var DATA = [], onSelectCb = null, opts = {};
    var _idx = -1, _rows = [];   // navegación con teclado (↑ ↓ Enter)
    var modal    = document.getElementById('tplk-modal-recuperar');
    var input    = document.getElementById('tplk-recuperar-input');
    var lista     = document.getElementById('tplk-recuperar-lista');
    var contador = document.getElementById('tplk-recuperar-contador');

    // Cerrar SOLO con Esc o la X (no al hacer click fuera).
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.preventDefault(); cerrar(); }
    });

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function fmt(n) { var v = parseFloat(n) || 0; return '$' + v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); }
    function fechaCorta(s) { if (!s) return ''; return String(s).slice(0, 16).replace('T', ' ').replace(/-/g, '/'); }

    function render() {
        var q = input.value.trim().toLowerCase();
        var rows = !q ? DATA : DATA.filter(function (b) {
            return (b.nombre && b.nombre.toLowerCase().indexOf(q) !== -1) ||
                   (b.cliente_nombre && b.cliente_nombre.toLowerCase().indexOf(q) !== -1);
        });
        _rows = rows;
        contador.textContent = rows.length + ' guardada' + (rows.length === 1 ? '' : 's');

        if (!rows.length) {
            _idx = -1;
            lista.innerHTML = '<div class="px-6 py-12 text-center text-sm text-gray-400">No hay ventas guardadas.</div>';
            return;
        }
        var html = '';
        rows.forEach(function (b, i) {
            var meta = [];
            if (b.usuario_nombre) meta.push(escapeHtml(b.usuario_nombre));
            if (b.sucursal_nombre) meta.push(escapeHtml(b.sucursal_nombre));
            meta.push(fechaCorta(b.created_at));
            html +=
              '<div class="recuperar-row flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50/50 transition-colors" data-idx="' + i + '">' +
                '<button type="button" data-pick="' + b.id + '" class="flex-1 text-left min-w-0">' +
                  '<div class="text-sm md:text-base font-semibold text-gray-800 truncate">' + escapeHtml(b.nombre) + '</div>' +
                  '<div class="text-xs text-gray-500 mt-0.5 truncate">' +
                    (b.cliente_nombre ? '👤 ' + escapeHtml(b.cliente_nombre) + ' · ' : '') +
                    (parseInt(b.items) || 0) + ' ítem(s) · ' + meta.join(' · ') +
                  '</div>' +
                '</button>' +
                '<span class="text-base font-black text-gray-800 flex-shrink-0">' + fmt(b.total_usd) + '</span>' +
                '<button type="button" data-del="' + b.id + '" title="Eliminar"' +
                        ' class="flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-colors">' +
                  '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                '</button>' +
              '</div>';
        });
        lista.innerHTML = html;

        Array.prototype.forEach.call(lista.querySelectorAll('[data-pick]'), function (el) {
            el.addEventListener('click', function () {
                var id = parseInt(el.dataset.pick, 10);
                cerrar();
                if (typeof onSelectCb === 'function') onSelectCb(id);
            });
        });
        Array.prototype.forEach.call(lista.querySelectorAll('[data-del]'), function (el) {
            el.addEventListener('click', function () { eliminar(parseInt(el.dataset.del, 10)); });
        });

        // Resaltar la primera por defecto para poder recuperarla con Enter de una vez.
        _idx = 0;
        marcar();
    }

    // Resalta la fila activa y la deja visible.
    function marcar() {
        var filas = lista.querySelectorAll('.recuperar-row');
        Array.prototype.forEach.call(filas, function (el, i) {
            var on = (i === _idx);
            el.classList.toggle('bg-amber-100', on);
            el.classList.toggle('ring-1', on);
            el.classList.toggle('ring-amber-300', on);
        });
        if (_idx >= 0 && filas[_idx]) filas[_idx].scrollIntoView({ block: 'nearest' });
    }

    function pickActivo() {
        if (_idx >= 0 && _rows[_idx]) {
            var id = parseInt(_rows[_idx].id, 10);
            cerrar();
            if (typeof onSelectCb === 'function') onSelectCb(id);
        }
    }

    function eliminar(id) {
        var doDel = function () {
            fetch('modulos/ventas/api_borrador_eliminar.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d && d.ok) { DATA = DATA.filter(function (b) { return parseInt(b.id) !== id; }); render(); if (window.appToast) appToast('Borrador eliminado', 'success'); }
                else if (window.appAlert) appAlert('No se pudo eliminar', (d && d.error) || '', 'error');
            });
        };
        if (window.appConfirm) appConfirm('¿Eliminar esta venta guardada?', 'No se puede deshacer.', doDel);
        else doDel();
    }

    function cargar() {
        lista.innerHTML = '<div class="px-6 py-10 flex flex-col items-center gap-3 text-gray-400">' +
            '<div class="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>' +
            '<span class="text-sm">Cargando...</span></div>';
        var origen = opts.origen || 'pos';
        fetch('modulos/ventas/api_borrador_listar.php?origen=' + encodeURIComponent(origen))
            .then(function (r) { return r.json(); })
            .then(function (d) { DATA = (d && d.ok) ? (d.borradores || []) : []; render(); })
            .catch(function () { lista.innerHTML = '<div class="px-6 py-10 text-center text-sm text-red-500">Error al cargar.</div>'; });
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
        if (!_rows.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _idx = (_idx < _rows.length - 1) ? _idx + 1 : 0;   // baja, y al final vuelve al inicio
            marcar();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _idx = (_idx > 0) ? _idx - 1 : _rows.length - 1;    // sube, y al inicio salta al final
            marcar();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            pickActivo();
        }
    });

    function abrir(onSelect, opciones) {
        onSelectCb = onSelect; opts = opciones || {};
        input.value = '';
        modal.classList.remove('hidden'); modal.classList.add('flex');
        setTimeout(function () { input.focus(); }, 30);
        cargar();
    }
    function cerrar() { modal.classList.add('hidden'); modal.classList.remove('flex'); }

    window.abrirRecuperarVenta  = abrir;
    window.cerrarRecuperarVenta = cerrar;
})();
8. MODAL OPERADOR (tplk-modal-operador) - Confirmación con PIN
javascript
(function () {
    if (window.__tplkOperadorInit) return;
    window.__tplkOperadorInit = true;

    var EMPLEADOS = [];
    var ES_ADMIN  = false;
    var ORDEN = { operador: 1, supervisor: 2, gerente: 3 };
    // true = el admin se identifica con la clave de su cuenta porque no tiene
    // un empleado del nivel requerido.
    var modoAdmin = false;

    var modal   = document.getElementById('tplk-modal-operador');
    var panel   = document.getElementById('op-panel');
    var selEmp  = document.getElementById('op-empleado');
    var boxEmp  = document.getElementById('op-empleado-box');
    var lblPin  = document.getElementById('op-pin-label');
    var inpPin  = document.getElementById('op-pin');
    var boxMot  = document.getElementById('op-motivo-box');
    var inpMot  = document.getElementById('op-motivo');
    var boxVac  = document.getElementById('op-vacio');
    var btnOk   = document.getElementById('op-confirmar');

    var _cb = null;
    var _cfg = {};

    function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    window.confirmarOperador = function (cfg, onConfirm) {
        _cfg = cfg || {};
        _cb  = (typeof onConfirm === 'function') ? onConfirm : null;

        document.getElementById('op-titulo').textContent    = _cfg.titulo    || '¿Quién realiza esta acción?';
        document.getElementById('op-subtitulo').textContent = _cfg.subtitulo || 'Identifícate con tu PIN para registrar quién lo hizo.';

        var nivelMin = _cfg.nivelMinimo || 'operador';
        var req = ORDEN[nivelMin] || 1;
        var lista = EMPLEADOS.filter(function (e) { return (ORDEN[e.nivel] || 1) >= req; });

        selEmp.innerHTML = lista.map(function (e) {
            return '<option value="' + e.id + '">' + esc(e.nombre) + (e.cargo ? ' — ' + esc(e.cargo) : '') + '</option>';
        }).join('');

        modoAdmin = false;
        if (lista.length) {
            // Camino normal: se identifica la persona con su PIN.
            boxVac.classList.add('hidden');
            boxEmp.classList.remove('hidden');
            btnOk.disabled = false;
            lblPin.textContent = 'PIN (4 dígitos)';
            inpPin.placeholder = '••••';
            inpPin.maxLength = 4;
            inpPin.inputMode = 'numeric';
            inpPin.classList.add('text-center', 'text-2xl', 'tracking-[0.5em]');
        } else if (ES_ADMIN) {
            // Administrador sin empleado del nivel requerido: se identifica con
            // la clave de su cuenta en vez de quedarse sin poder hacer nada.
            modoAdmin = true;
            boxVac.textContent = EMPLEADOS.length
                ? 'No tienes un empleado con nivel ' + nivelMin + ' o superior. Como administrador puedes autorizar con la clave de tu cuenta.'
                : 'Aún no tienes un empleado registrado. Como administrador puedes autorizar con la clave de tu cuenta (o crear tu empleado en Seguridad → Empleados).';
            boxVac.classList.remove('hidden');
            boxEmp.classList.add('hidden');
            btnOk.disabled = false;
            lblPin.textContent = 'Clave de tu usuario';
            inpPin.placeholder = 'Tu contraseña de acceso';
            inpPin.maxLength = 64;          // el HTML trae maxlength=4 para el PIN
            inpPin.inputMode = 'text';
            inpPin.classList.remove('text-center', 'text-2xl', 'tracking-[0.5em]');
        } else {
            // Sin empleados que califiquen y sin ser admin → no puede autorizar.
            boxVac.textContent = EMPLEADOS.length
                ? 'No hay un empleado con nivel ' + nivelMin + ' o superior asignado a este usuario para autorizar esta acción.'
                : 'No hay empleados registrados para este usuario. Crea los empleados en Seguridad → Empleados.';
            boxVac.classList.remove('hidden');
            boxEmp.classList.add('hidden');
            btnOk.disabled = true;
        }

        inpPin.value = '';
        inpMot.value = '';
        if (_cfg.requiereMotivo) boxMot.classList.remove('hidden'); else boxMot.classList.add('hidden');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(function () { (lista.length || modoAdmin ? inpPin : btnOk).focus(); }, 50);
    };

    window.cerrarModalOperador = function () {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        _cb = null;
    };

    window.opConfirmar = function () {
        if (btnOk.disabled) return;
        var empleado_id = parseInt(selEmp.value, 10) || 0;
        var pin = (inpPin.value || '').trim();
        var motivo = (inpMot.value || '').trim();

        if (modoAdmin) {
            empleado_id = 0;   // el servidor lo resuelve por la clave del usuario
            // Es la contraseña de la cuenta, no un PIN: puede tener cualquier
            // largo. El servidor (password_verify) es quien de verdad la
            // valida; aqui solo se exige que no venga vacia.
            if (pin.length < 1) { appAlert('Clave requerida', 'Escribe la clave de tu usuario.', 'warning'); return; }
        } else {
            if (!empleado_id) { appAlert('Selecciona empleado', 'Elige quién realiza la acción.', 'warning'); return; }
            if (!/^\d{4}$/.test(pin)) { appAlert('PIN inválido', 'El PIN son 4 dígitos.', 'warning'); return; }
        }
        if (_cfg.requiereMotivo && motivo.length < (_cfg.minMotivo || 5)) {
            appAlert('Motivo requerido', 'Describe el motivo (mínimo ' + (_cfg.minMotivo || 5) + ' caracteres).', 'warning'); return;
        }

        var cb = _cb;
        cerrarModalOperador();
        if (cb) cb({ empleado_id: empleado_id, pin: pin, motivo: motivo });
    };

    // Teclado: ESC cierra · ENTER confirma
    document.addEventListener('keydown', function (e) {
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') { e.preventDefault(); cerrarModalOperador(); }
        else if (e.key === 'Enter') { e.preventDefault(); opConfirmar(); }
    });
    // Solo dígitos en el PIN — pero la clave del admin sí lleva letras.
    inpPin.addEventListener('input', function () {
        if (modoAdmin) return;
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });
    // Click fuera cierra
    modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModalOperador(); });
})();
9. CORREGIR RECEPCIÓN (tplk-modal-corregir-recepcion)
javascript
(function () {
    if (window.__tplkCorregirRecepcionInit) return;
    window.__tplkCorregirRecepcionInit = true;

    var modal = document.getElementById('tplk-modal-corregir-recepcion');
    var _detalleId = 0;
    var _productoCorrecto = null;

    window.abrirCorregirRecepcion = function (detalleOrdenCompraId, datos) {
        datos = datos || {};
        _detalleId = detalleOrdenCompraId;
        _productoCorrecto = null;

        document.getElementById('cr-resumen').textContent =
            'Se recibió como: ' + (datos.producto_nombre || '?') + ' · Pedidas: ' + (datos.pedidas || 0) + ' · Recibidas: ' + (datos.recibidas || 0);
        document.getElementById('cr-max').textContent = '(máx. ' + (datos.recibidas || 0) + ')';
        document.getElementById('cr-cantidad').value = datos.recibidas || '';
        document.getElementById('cr-cantidad').max = datos.recibidas || '';
        document.getElementById('cr-deposito').value = datos.deposito_sugerido_id || '';
        document.getElementById('cr-producto-nombre').textContent = '🔍 Buscar producto...';
        document.getElementById('cr-producto-nombre').className = 'text-gray-400';
        document.getElementById('cr-costo').value = '';
        document.getElementById('cr-motivo').value = '';

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.cerrarModalCorregirRecepcion = function () {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    window.crElegirProducto = function () {
        if (typeof window.abrirBuscadorProductos !== 'function') { appAlert('No disponible', 'El buscador de productos no cargó. Recarga con Ctrl+F5.', 'error'); return; }
        window.abrirBuscadorProductos(function (p) {
            if (!p || !p.id) return;
            _productoCorrecto = p;
            document.getElementById('cr-producto-nombre').textContent = p.nombre || ('Producto #' + p.id);
            document.getElementById('cr-producto-nombre').className = 'text-gray-800 font-semibold';
            if (!document.getElementById('cr-costo').value) {
                document.getElementById('cr-costo').value = (parseFloat(p.costo) || 0).toFixed(2);
            }
        }, { titulo: 'Producto que realmente llegó', subtitulo: 'Selecciónalo para corregir la línea' });
    };

    window.crConfirmar = function () {
        var deposito_id = parseInt(document.getElementById('cr-deposito').value, 10) || 0;
        var cantidad = parseInt(document.getElementById('cr-cantidad').value, 10) || 0;
        var costo = parseFloat(document.getElementById('cr-costo').value);
        var motivo = (document.getElementById('cr-motivo').value || '').trim();

        if (!deposito_id) { appAlert('Falta el depósito', 'Selecciona dónde está físicamente la mercancía.', 'warning'); return; }
        if (cantidad <= 0) { appAlert('Cantidad inválida', 'Indica cuántas unidades corregir.', 'warning'); return; }
        if (!_productoCorrecto) { appAlert('Falta el producto', 'Busca y selecciona el producto que realmente llegó.', 'warning'); return; }
        if (isNaN(costo) || costo < 0) { appAlert('Costo inválido', 'Indica el costo unitario real.', 'warning'); return; }
        if (motivo.length < 5) { appAlert('Motivo requerido', 'Describe el motivo (mínimo 5 caracteres).', 'warning'); return; }

        var payload = {
            detalle_orden_compra_id: _detalleId,
            deposito_id: deposito_id,
            cantidad: cantidad,
            producto_correcto_id: _productoCorrecto.id,
            costo_correcto: costo,
            motivo: motivo
        };

        cerrarModalCorregirRecepcion();
        window.confirmarOperador({
            modulo: 'compras', accion: 'corregir_recepcion', nivelMinimo: 'supervisor',
            titulo: '¿Quién autoriza esta corrección?', subtitulo: 'Se moverá el stock y se ajustará la deuda de la orden.'
        }, function (auth) {
            payload.empleado_id = auth.empleado_id;
            payload.pin = auth.pin;
            fetch('modulos/compras/corregir_recepcion.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d.ok) { appAlert('No se pudo corregir', d.error || 'Error desconocido.', 'error'); return; }
                appToast(d.mensaje || 'Línea corregida', 'success');
                if (typeof window.__crRecargar === 'function') window.__crRecargar();
                else setTimeout(function () { location.reload(); }, 800);
            })
            .catch(function () { appAlert('Error de conexión', 'No se pudo enviar la corrección.', 'error'); });
        });
    };

    // Click fuera cierra
    modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModalCorregirRecepcion(); });
})();
10. ANULAR RECEPCIÓN (tplk-modal-anular-recepcion)
javascript
(function () {
    if (window.__tplkAnularRecepcionInit) return;
    window.__tplkAnularRecepcionInit = true;

    var modal = document.getElementById('tplk-modal-anular-recepcion');
    var _ordenId = 0;

    window.abrirAnularRecepcion = function (ordenId, datos) {
        datos = datos || {};
        _ordenId = ordenId;
        document.getElementById('ar-resumen').textContent = 'Orden ' + (datos.numero_orden || '#' + ordenId);
        document.getElementById('ar-deposito').value = datos.deposito_sugerido_id || '';
        document.getElementById('ar-motivo').value = '';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.cerrarModalAnularRecepcion = function () {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    window.arConfirmar = function () {
        var deposito_id = parseInt(document.getElementById('ar-deposito').value, 10) || 0;
        var motivo = (document.getElementById('ar-motivo').value || '').trim();

        if (!deposito_id) { appAlert('Falta el depósito', 'Selecciona dónde se recibió la mercancía.', 'warning'); return; }
        if (motivo.length < 5) { appAlert('Motivo requerido', 'Describe el motivo (mínimo 5 caracteres).', 'warning'); return; }

        var payload = { orden_id: _ordenId, deposito_id: deposito_id, motivo: motivo };

        cerrarModalAnularRecepcion();
        window.confirmarOperador({
            modulo: 'compras', accion: 'anular_recepcion_orden', nivelMinimo: 'supervisor',
            titulo: '¿Quién autoriza anular esta recepción?', subtitulo: 'Se revertirá TODO el inventario recibido y la orden volverá a tránsito.'
        }, function (auth) {
            payload.empleado_id = auth.empleado_id;
            payload.pin = auth.pin;
            fetch('modulos/compras/anular_recepcion_orden.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d.ok) { appAlert('No se pudo anular', d.error || 'Error desconocido.', 'error'); return; }
                appToast(d.mensaje || 'Recepción anulada', 'success');
                setTimeout(function () { navegarModulo('compras', 'recepcion_mercancia', null, { preventDefault: function () {} }, { orden_id: _ordenId }); }, 800);
            })
            .catch(function () { appAlert('Error de conexión', 'No se pudo enviar la anulación.', 'error'); });
        });
    };

    modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModalAnularRecepcion(); });
})();
11. NOTIFICACIONES (campana del header)
javascript
(function () {
    var counts = {};
    var META = {
        solicitudes:  { label: 'Solicitudes de traslado',   icon: '🔁', mod: 'inventario',       view: 'solicitudes_recibidas' },
        dispositivos: { label: 'Dispositivos por autorizar', icon: '🛡️', mod: 'centro_seguridad', view: 'dispositivos' },
        conciliacion: { label: 'Pagos por conciliar',        icon: '🏦', mod: 'bancos',           view: 'conciliacion' },
        solicitudes_credito: { label: 'Autorizaciones de venta (crédito / precio)', icon: '🛡️', mod: 'ventas', view: 'solicitudes_credito' }
    };
    // Orden por urgencia: soporte va primero porque tiene un reloj de 48 h
    // corriendo y un cliente esperando respuesta.
    var ORDER = ['soporte', 'soporte_aut', 'garantia', 'solicitudes_credito', 'solicitudes', 'pedidos', 'dispositivos', 'conciliacion'];
    function total() { var t = 0; ORDER.forEach(function (k) { t += (counts[k] || 0); }); return t; }
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

    function render() {
        var badge = document.getElementById('notif-count');
        var list  = document.getElementById('notif-list');
        var lbl   = document.getElementById('notif-total-lbl');
        var bell  = document.getElementById('notif-bell');
        if (!badge || !list) return;
        var t = total();
        if (t > 0) { badge.textContent = t > 99 ? '99+' : t; badge.classList.remove('hidden'); if (bell) bell.classList.add('animate-pulse'); }
        else       { badge.classList.add('hidden'); if (bell) bell.classList.remove('animate-pulse'); }
        if (lbl) lbl.textContent = t > 0 ? (t + ' en total') : '';
        var rows = '';
        ORDER.forEach(function (k) {
            var c = counts[k] || 0; if (c <= 0) return;
            var m = META[k];
            rows += '<button type="button" onclick="notifIr(\'' + k + '\')" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-left transition-colors">' +
                      '<span class="text-lg leading-none">' + m.icon + '</span>' +
                      '<span class="flex-1 text-sm text-gray-700 font-semibold">' + esc(m.label) + '</span>' +
                      '<span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full">' + (c > 99 ? '99+' : c) + '</span>' +
                    '</button>';
        });
        list.innerHTML = rows || '<div class="px-4 py-8 text-center text-sm text-gray-400">✓ Todo al día</div>';
    }

    window.notifSet = function (k, c) { counts[k] = parseInt(c, 10) || 0; render(); };
    window.notifToggle = function (ev) { if (ev) ev.stopPropagation(); var p = document.getElementById('notif-panel'); if (p) p.classList.toggle('hidden'); render(); };
    window.notifIr = function (k) {
        var m = META[k]; if (!m) return;
        var p = document.getElementById('notif-panel'); if (p) p.classList.add('hidden');
        if (typeof navegarModulo === 'function') navegarModulo(m.mod, m.view, null, { preventDefault: function () {} });
    };
    document.addEventListener('click', function (e) {
        var w = document.getElementById('notif-wrap'), p = document.getElementById('notif-panel');
        if (p && w && !w.contains(e.target)) p.classList.add('hidden');
    });
})();
12. CONCILIACIÓN - Badge automático
javascript
(function () {
    function refrescarConciliacion() {
        fetch('modulos/finanzas/api_conciliacion_pendientes.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d || !d.ok) return;
                if (window.notifSet) window.notifSet('conciliacion', d.count);
                var badge = document.getElementById('badge-conciliacion');
                if (!badge) return;
                if (d.count > 0) { badge.textContent = d.count > 99 ? '99+' : d.count; badge.classList.remove('hidden'); }
                else { badge.classList.add('hidden'); }
            })
            .catch(function () {});
    }
    window.__refrescarBadgeConciliacion = refrescarConciliacion;
    refrescarConciliacion();
    setInterval(refrescarConciliacion, 30000);
})();
13. SISTEMA ABIERTO / CIERRE AUTOMÁTICO (Centro de Seguridad)
javascript
// Centro de Seguridad: si el sistema cierra (horario), saca al usuario aunque esté inactivo.
(function () {
    function chequear() {
        fetch('api_sistema_abierto.php', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d && d.ok && d.abierto === false) {
                    window.location.href = 'index.php?error=' + encodeURIComponent(d.mensaje || 'Sistema fuera de línea.');
                }
            })
            .catch(function () {});
    }
    setInterval(chequear, 60000); // revisa cada minuto
})();
14. CRON DE RESPALDO (Centro de Seguridad)
javascript
// Centro de Seguridad: pseudo-cron de respaldo. Dispara en 2do plano al entrar;
// el servidor decide si "ya tocaba" (días/hora). No bloquea la interfaz.
(function () {
    setTimeout(function () {
        fetch('modulos/centro_seguridad/cron_respaldo.php', { cache: 'no-store' }).catch(function () {});
    }, 4000);
})();
15. FUNCIONES PARA FACTURA FISCAL (vista específica)
javascript
function ffFormatoMoneda(titulo, cb) {
    Swal.fire({
        title: titulo || 'Formato del documento',
        text: '¿En qué moneda quieres el documento?',
        icon: 'question',
        showDenyButton: true, showCancelButton: true,
        confirmButtonText: '💵 Solo Dólares',
        denyButtonText: 'Bs Solo Bolívares',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#080A0C', denyButtonColor: '#059669',
        customClass: { popup: 'rounded-2xl' }
    }).then(function (r) {
        if (r.isConfirmed) cb('usd');
        else if (r.isDenied) cb('bs');
    });
}

function ffImprimirFactura(id) {
    var SVG_DOC = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    var SVG_TK  = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14h6m-6-4h6m-7 8H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v12l-2.5-1.5L15 18l-2.5-1.5L10 18l-2-1.2z"/></svg>';
    function card(btnId, color, icono, titulo, sub) {
        return '<button id="' + btnId + '" type="button" class="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-' + color + '-400 hover:bg-' + color + '-50 transition-all text-left">' +
               '<span class="flex-shrink-0 w-10 h-10 rounded-lg bg-' + color + '-100 text-' + color + '-600 flex items-center justify-center">' + icono + '</span>' +
               '<span class="min-w-0"><span class="block font-bold text-gray-800 text-sm">' + titulo + '</span>' +
               '<span class="block text-xs text-gray-500">' + sub + '</span></span></button>';
    }
    Swal.fire({
        title: 'Imprimir factura',
        html: '<p class="text-sm text-gray-500 mb-3">Elige el formato de impresión</p>' +
              '<div class="flex flex-col gap-2.5 text-left">' +
              card('imp-a4-usd', 'brand',  SVG_DOC, 'Documento A4 / PDF', 'Precios en dólares ($)') +
              card('imp-a4-bs',  'emerald', SVG_DOC, 'Documento A4 / PDF', 'Precios en bolívares (Bs)') +
              card('imp-tk-usd', 'brand',  SVG_TK,  'Ticket 80mm', 'Tickera térmica · en dólares ($)') +
              card('imp-tk-bs',  'teal',    SVG_TK,  'Ticket 80mm', 'Tickera térmica · en bolívares') +
              '</div>',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        width: 430,
        customClass: { popup: 'rounded-2xl' },
        didOpen: function () {
            var base = 'impresiones/ventas/';
            var go = function (url) { Swal.close(); window.open(url, '_blank'); };
            document.getElementById('imp-a4-usd').onclick = function () { go(base + 'pdf_documento.php?id=' + id + '&moneda=usd'); };
            document.getElementById('imp-a4-bs').onclick  = function () { go(base + 'pdf_documento.php?id=' + id + '&moneda=bs'); };
            document.getElementById('imp-tk-usd').onclick = function () { go(base + 'factura_ticket80.php?id=' + id + '&moneda=usd'); };
            document.getElementById('imp-tk-bs').onclick  = function () { go(base + 'factura_ticket80.php?id=' + id + '&moneda=bs'); };
        }
    });
}

function enviarFacturaWA(id, num, btn) {
    ffFormatoMoneda('Enviar ' + num + ' por WhatsApp', function (moneda) {
        if (btn) { btn.disabled = true; btn.classList.add('opacity-50', 'pointer-events-none'); }
        fetch('modulos/ventas/api_enviar_doc_wa.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factura_id: id, moneda: moneda })
        }).then(function (r) { return r.json(); }).then(function (d) {
            if (d.ok) {
                appToast('Enviado por WhatsApp', 'success');
                appAlert('WhatsApp enviado', d.mensaje || 'Documento enviado.', 'success');
            } else if (d.sin_telefono) {
                appAlert('Sin teléfono', 'El cliente no tiene un número de WhatsApp válido. Agrégalo en su ficha.', 'warning');
            } else {
                appAlert('No se pudo enviar', d.error || 'Error al enviar por WhatsApp.', 'error');
            }
        }).catch(function () {
            appAlert('Error de red', 'Sin conexión con el servidor.', 'error');
        }).finally(function () {
            if (btn) { btn.disabled = false; btn.classList.remove('opacity-50', 'pointer-events-none'); }
        });
    });
}

function anularFacturaFiscalLista(id, num) {
    Swal.fire({
        title: 'Anular ' + num, icon: 'warning', input: 'text',
        inputLabel: 'Motivo de la anulación (mínimo 5 caracteres)',
        inputPlaceholder: 'Ej: error en la factura, devolución total...',
        showCancelButton: true, confirmButtonText: 'Continuar', cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626', customClass: { popup: 'rounded-2xl' },
        inputValidator: function (v) { return (!v || v.trim().length < 5) ? 'Mínimo 5 caracteres' : undefined; }
    }).then(function (r) {
        if (!r.isConfirmed) return;
        var motivo = (r.value || '').trim();
        window.confirmarOperador(
            { modulo: 'ventas', accion: 'anular_factura', nivelMinimo: 'supervisor', requiereMotivo: false,
              titulo: '¿Quién autoriza la anulación?', subtitulo: 'Solo supervisor o gerente.' },
            function (op) {
                fetch('modulos/ventas/anular_factura.php', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ factura_id: id, motivo: motivo, empleado_id: op.empleado_id, pin: op.pin })
                }).then(function (rr) { return rr.json(); }).then(function (d) {
                    if (d.ok) { appToast('Factura anulada', 'success'); setTimeout(function () { location.reload(); }, 800); }
                    else appAlert('Error', d.error || 'No se pudo anular', 'error');
                }).catch(function () { appAlert('Error de red', 'Sin conexión con el servidor.', 'error'); });
            }
        );
    });
}

window.ffFormatoMoneda = ffFormatoMoneda;
window.ffImprimirFactura = ffImprimirFactura;
window.enviarFacturaWA = enviarFacturaWA;
window.anularFacturaFiscalLista = anularFacturaFiscalLista;
Resumen de todo el JavaScript incluido
#	Módulo	Función
1	Navegación SPA	toggleSubmenu, navegarModulo, toggleSidebar
2	Elegir documento (F1)	tfElegirDocumento, tfDocEstilos, tfDocTarjeta
3	Alertas globales	appAlert, appConfirm, appToast
4	Select searchable	makeSelectSearchable
5	Buscador de productos	abrirBuscadorProductos, cerrarBuscadorProductos
6	Modal de cobro	abrirModalCobro, cerrarModalCobro, cobroConfirmar, etc.
7	Modal de reembolso	abrirModalReembolso, cerrarModalReembolso, reemConfirmar
8	Modal de clientes	abrirBuscadorClientes, cerrarBuscadorClientes, cliValidarCliente
9	Modal de item (cantidad/precio)	abrirModalCantidad, abrirModalPrecio, tplkItemConfirmar
10	Consultor de precios	abrirConsultorPrecio, cerrarConsultorPrecio
11	Recuperar venta	abrirRecuperarVenta, cerrarRecuperarVenta
12	Modal operador (PIN)	confirmarOperador, cerrarModalOperador, opConfirmar
13	Corregir recepción	abrirCorregirRecepcion, crElegirProducto, crConfirmar
14	Anular recepción	abrirAnularRecepcion, arConfirmar
15	Notificaciones	notifSet, notifToggle, notifIr
16	Badge conciliación	__refrescarBadgeConciliacion
17	Sistema abierto/cerrado	Chequeo automático cada 60s
18	Cron de respaldo	Disparo en segundo plano
19	Factura fiscal	ffImprimirFactura, enviarFacturaWA, anularFacturaFiscalLista
