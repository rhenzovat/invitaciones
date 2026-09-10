<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('web_whatsapp_config')) {
            Schema::create('web_whatsapp_config', function (Blueprint $table) {
                $table->id();
                $table->string('wa_numero', 30)->default('51982311335');
                $table->text('wa_mensaje')->nullable();
                $table->string('wa_burbuja_linea1', 200)->nullable();
                $table->string('wa_burbuja_linea2', 200)->nullable();
                $table->string('wa_label', 50)->default('WhatsApp');
                $table->string('wa_badge', 10)->default('1');
                $table->decimal('wa_delay_segundos', 4, 1)->default(2.5);
                $table->enum('Activo', ['S', 'N'])->default('S');
                $table->timestamps();
            });
        }

        if (DB::table('web_whatsapp_config')->where('id', 1)->exists()) {
            return;
        }

        $numero  = '51982311335';
        $mensaje = '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!';

        if (Schema::hasTable('web_footer')) {
            $footer = DB::table('web_footer')->where('id_footer', 1)->first();
            if ($footer) {
                if (! empty($footer->whatsapp_mensaje)) {
                    $mensaje = $footer->whatsapp_mensaje;
                }
                if (! empty($footer->url_whatsapp) && preg_match('/(?:phone=|wa\.me\/)(\d{9,15})/', $footer->url_whatsapp, $m)) {
                    $numero = $m[1];
                } elseif (! empty($footer->contacto_telefono)) {
                    $digits = preg_replace('/\D/', '', $footer->contacto_telefono);
                    if (strlen($digits) === 9) {
                        $numero = '51' . $digits;
                    } elseif ($digits !== '') {
                        $numero = $digits;
                    }
                }
            }
        }

        DB::table('web_whatsapp_config')->insert([
            'id'                => 1,
            'wa_numero'         => $numero,
            'wa_mensaje'        => $mensaje,
            'wa_burbuja_linea1' => '💆‍♀️ ¿Lista para reservar tu experiencia?',
            'wa_burbuja_linea2' => '¡Escríbenos!',
            'wa_label'          => 'WhatsApp',
            'wa_badge'          => '1',
            'wa_delay_segundos' => 2.5,
            'Activo'            => 'S',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        if (! Schema::hasTable('sistema_menu')) {
            return;
        }

        if (DB::table('sistema_menu')->where('url', '/whatsapp/index')->exists()) {
            return;
        }

        $maxOrden = (int) DB::table('sistema_menu')->max('orden');
        $data = [
            'nombre'     => 'WhatsApp Flotante',
            'url'        => '/whatsapp/index',
            'Activo'     => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ];
        if (Schema::hasColumn('sistema_menu', 'orden')) {
            $data['orden'] = $maxOrden + 1;
        }
        if (Schema::hasColumn('sistema_menu', 'Icon')) {
            $data['Icon'] = 'chat';
        }
        DB::table('sistema_menu')->insert($data);
    }

    public function down(): void
    {
        if (Schema::hasTable('sistema_menu')) {
            DB::table('sistema_menu')->where('url', '/whatsapp/index')->delete();
        }
        Schema::dropIfExists('web_whatsapp_config');
    }
};
