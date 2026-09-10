<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebContactoMensaje;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class WebContactoMensajeController extends Controller
{
    /**
     * Guarda un mensaje enviado desde el formulario público de contacto.
     * Endpoint público (sin auth) — protegido por throttle en la ruta.
     */
    public function crear(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'           => 'required|string|max:150',
            'apellido'         => 'nullable|string|max:150',
            'email'            => 'nullable|email|max:200',
            'telefono'         => 'nullable|string|max:60',
            'producto_interes' => 'nullable|string|max:255',
            'asunto'           => 'nullable|string|max:200',
            'mensaje'          => 'required|string|max:5000',
        ]);

        $mensaje = WebContactoMensaje::create([
            'nombre'           => $data['nombre'],
            'apellido'         => $data['apellido'] ?? null,
            'email'            => $data['email'] ?? null,
            'telefono'         => $data['telefono'] ?? null,
            'producto_interes' => $data['producto_interes'] ?? null,
            'asunto'           => $data['asunto'] ?? ($data['producto_interes'] ?? null),
            'mensaje'          => $data['mensaje'],
            'fecha_mensaje'    => now()->toDateString(),
            'email_enviado'    => 'N',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $datosCorreo = [
            'txt_nombre'  => trim($data['nombre'] . ' ' . ($data['apellido'] ?? '')),
            'txt_email'   => $data['email'] ?? 'No proporcionado',
            'txt_telefono'=> $data['telefono'] ?? 'No proporcionado',
            'txt_asunto'  => $data['asunto'] ?? ($data['producto_interes'] ?? 'Mensaje de contacto'),
            'txt_mensaje' => $data['mensaje'],
        ];

        try {
            Mail::send('email.formContacto', $datosCorreo, function ($message) use ($data) {
                $message->from(config('mail.from.address'), config('mail.from.name'));
                $message->to(config('mail.contact_to'))
                    ->subject('Nuevo mensaje de contacto - ' . ($data['asunto'] ?? $data['nombre']));

                if (!empty($data['email'])) {
                    $message->replyTo($data['email'], $data['nombre']);
                }
            });

            $mensaje->update(['email_enviado' => 'S']);
            Log::info('CONTACTO_EMAIL_EXITO: mensaje enviado para ' . $data['email'] . ' / ' . $data['nombre']);
        } catch (\Throwable $e) {
            Log::error('CONTACTO_EMAIL_ERROR: ' . $e->getMessage(), [
                'nombre' => $data['nombre'],
                'email' => $data['email'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mensaje recibido correctamente.',
            'result'  => $mensaje,
        ], 201);
    }

    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Listar mensajes',
            'result'  => WebContactoMensaje::orderByDesc('created_at')->get(),
        ]);
    }

    public function obtener(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:web_contacto_mensaje,id']);

        return response()->json([
            'success' => true,
            'message' => 'Obtener mensaje',
            'result'  => WebContactoMensaje::findOrFail($request->id),
        ]);
    }
}
