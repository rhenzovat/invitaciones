<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * Limpieza del CMS genérico reciclado (Amour Spa / Royal Masajes / tienda /
 * cotizaciones / campus / envíos) que ya no se usa: esta app hoy solo sirve
 * la invitación de boda (web_evento y afines) más los módulos genéricos de
 * plataforma (Accesos & Seguridad, Administración, SEO & Metadatos, Orden
 * del sidebar).
 *
 * Cada tabla listada aquí fue verificada sin ningún Model activo, ruta en
 * routes/api.php ni routes/web.php, ni referencia real desde el frontend
 * (más allá de páginas ya rotas que llaman endpoints inexistentes).
 *
 * IMPORTANTE: campus_clientes y campus_proyectos se auditaron como "sin
 * ruta HTTP" pero se excluyeron de este listado a propósito — tienen datos
 * reales (55 filas) referenciados vía FK por notificacion_alerta, que sí
 * corre activamente cada minuto (comando notificacion:evaluar).
 */
return new class extends Migration
{
    private array $tablas = [
        'administracion_cliente_direcciones',
        'administracion_comprobante',
        'administracion_forma_pago',
        'auditoria_seguridad',
        'oferta_promociones_membresia',
        'ope_metodo_envio',
        'ope_metodo_pago',
        'ope_pedidos_ficha_tecnica',
        'ope_pedidos_estado_historial',
        'ope_pedidos_estado',
        'ope_pedidos_producto',
        'ope_pedidos',
        'del_configuracion_delivery',
        'envio_districts',
        'envio_departments',
        'envio_shipping_agencies',
        'envio_shipping_costs',
        'envio_shipping_settings',
        'oferta_costo_envios',
        'oferta_precios_peso',
        'oferta_del_dia',
        'oferta_promociones',
        'cotizacion_presupuesto_detalle',
        'cotizacion_presupuesto_qr_log',
        'cotizacion_presupuesto',
        'cotizacion_config',
        'cotizacion_modulo',
        'cotizacion_tipo_proyecto',
        'excalidraw_scenes',
        'product_user_ratings',
        'product',
        'web_eventos',
        'web_ejemplares_seccion',
        'web_ejemplares',
        'web_portafolio_seccion',
        'web_portafolio',
        'web_pagina_maquinarias',
        'web_maquinarias_item',
        'web_pagina_marca',
        'web_populares_banners',
        'web_populares_catgorias',
        'web_favoritos',
        'password_reset_tokens',
    ];

    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        foreach ($this->tablas as $tabla) {
            Schema::dropIfExists($tabla);
        }
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Irreversible a propósito: estas tablas no tenían datos ni código
        // en uso. Restaurar desde el backup mysqldump si hiciera falta.
    }
};
