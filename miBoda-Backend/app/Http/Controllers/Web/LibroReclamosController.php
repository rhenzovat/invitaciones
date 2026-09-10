<?php

namespace App\Http\Controllers\Web;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

use App\Models\MetadatosPagina;

class LibroReclamosController  extends Controller
{

    public function web_libro_reclamos()
    {
        $metaData = MetadatosPagina::metaVigente('web_libro_reclamos');
        return view('web.pages.web_libro_reclamos',compact('metaData'));
    }

    /**
     * Permite buscar por número REC-xxx o por documento (DNI / RUC / CE).
     */
    public function web_libro_reclamos_estado(Request $request)
    {
        $metaData = null;
        $codigo    = trim((string) $request->input('codigo'));
        $documento = trim((string) $request->input('documento'));
        $reclamo    = null;
        $reclamos   = collect();
        $mensaje    = null;

        try {
            $metaData = MetadatosPagina::metaVigente('web_libro_reclamos');

            if ($request->isMethod('post') && ($codigo || $documento)) {
                $query = DB::table('web_reclamos');

                if ($codigo) {
                    // Admite formato REC-0001 o solo 1 / 0001
                    $numero = preg_replace('/[^0-9]/', '', $codigo);
                    if ($numero !== '') {
                        $query->where('id_web_reclamos', (int) $numero);
                    }
                }

                if ($documento) {
                    $query->where('numero_documento', $documento);
                }

                $reclamos = $query->orderBy('fecha_registro', 'desc')->get();
                $reclamo = $reclamos->first();

                if (!$reclamo) {
                    $mensaje = 'No se encontró un reclamo con los datos ingresados.';
                }
            }

            $viewName = 'web.pages.web_libro_reclamos_estado';
            Log::debug('web_libro_reclamos_estado view_exists?', [
                'view' => $viewName,
                'exists' => view()->exists($viewName),
            ]);

            Log::debug('web_libro_reclamos_estado', [
                'method' => $request->method(),
                'codigo' => $codigo,
                'documento' => $documento,
                'reclamoEncontrado' => (bool) $reclamo,
                'reclamoId' => $reclamo ? $reclamo->id_web_reclamos : null,
                'estado' => $reclamo ? $reclamo->estado : null,
            ]);
            if (!view()->exists('web.pages.web_libro_reclamos_estado')) {
                return response('Vista de seguimiento no encontrada en el servidor.', 200);
            }

            return view('web.pages.web_libro_reclamos_estado', [
                'metaData' => $metaData,
                'codigo' => $codigo,
                'documento' => $documento,
                'reclamo' => $reclamo,
                'reclamos' => $reclamos,
                'mensaje' => $mensaje,
            ]);
        } catch (\Throwable $e) {
            Log::error('web_libro_reclamos_estado error: ' . $e->getMessage(), [
                'codigo' => $codigo,
                'documento' => $documento,
                'trace' => $e->getTraceAsString(),
            ]);
            $mensaje = 'Ocurrió un error al cargar la consulta del reclamo. Inténtalo nuevamente.';
            
            return response($mensaje, 200);
        }
    }

    public function web_libro_reclamos_enviar(Request $request)
    {
        // 1. Validaci贸n de datos (sin requerir uploaded_file)
        $validated = $request->validate([
            'document_type' => 'required|in:DNI,RUC,CE',
            'document_number' => 'required|string|max:20',
            'business_name' => 'nullable|string|max:100',
            'first_name' => 'required|string|max:50',
            'last_name_father' => 'required|string|max:50',
            'last_name_mother' => 'nullable|string|max:50',
            'phone' => 'required|string|max:15',
            'email' => 'required|email|max:100',
            'department' => 'required|string|max:50',
            'province' => 'required|string|max:50',
            'district' => 'required|string|max:50',
            'address' => 'required|string|max:200',
            'request_type' => 'required|in:complaint,claim',
            'request_details' => 'required|string',
            'uploaded_file.*' => 'sometimes|file|max:5120|mimes:png,jpeg,jpg,docx,doc,pdf', // Cambiado a 'sometimes'
        ], [
            'uploaded_file.*.max' => 'Cada archivo no debe exceder los 5MB',
            'uploaded_file.*.mimes' => 'Solo se permiten archivos PNG, JPEG, JPG, DOCX, DOC o PDF'
        ]);

        // 2. Procesar archivos adjuntos (si existen)
        $archivosAdjuntos = [];
        if ($request->hasFile('uploaded_file')) {
            foreach ($request->file('uploaded_file') as $archivo) {
                if ($archivo->isValid()) {
                    $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
                    $ruta = $archivo->storeAs('public/reclamos', $nombreArchivo);

                    $archivosAdjuntos[] = [
                        'nombre_original' => $archivo->getClientOriginalName(),
                        'ruta' => Storage::url($ruta),
                        'tamanio' => $archivo->getSize(),
                        'mime_type' => $archivo->getMimeType()
                    ];
                }
            }
        }

        // 3. Insertar datos en la tabla
        $idReclamo = DB::table('web_reclamos')->insertGetId([
            'tipo_documento' => $validated['document_type'],
            'numero_documento' => $validated['document_number'],
            'razon_social' => $validated['business_name'] ?? null,
            'nombres' => $validated['first_name'],
            'apellido_paterno' => $validated['last_name_father'],
            'apellido_materno' => $validated['last_name_mother'] ?? null,
            'telefono' => $validated['phone'],
            'email' => $validated['email'],
            'departamento' => $validated['department'],
            'provincia' => $validated['province'],
            'distrito' => $validated['district'],
            'direccion' => $validated['address'],
            'tipo_solicitud' => $validated['request_type'],
            'detalles_solicitud' => $validated['request_details'],
            'archivos_adjuntos' => !empty($archivosAdjuntos) ? json_encode($archivosAdjuntos) : null,
            'ip_cliente' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'fecha_registro' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 4. Enviar notificaci贸n por correo
        $datosCorreo = [
            'tipo_documento' => $validated['document_type'],
            'numero_documento' => $validated['document_number'],
            'nombres' => $validated['first_name'],
            'apellidos' => $validated['last_name_father'] . ' ' . ($validated['last_name_mother'] ?? ''),
            'razon_social' => $validated['business_name'] ?? 'No especificada',
            'telefono' => $validated['phone'],
            'email' => $validated['email'],
            'departamento' => $validated['department'],
            'provincia' => $validated['province'],
            'distrito' => $validated['district'],
            'direccion' => $validated['address'],
            'tipo_solicitud' => $validated['request_type'] == 'complaint' ? 'Queja' : 'Reclamo',
            'detalles_solicitud' => $validated['request_details'],
            'numero_reclamo' => 'REC-' . $idReclamo,
            'fecha_registro' => now()->format('d/m/Y H:i:s'),
            'archivos_adjuntos' => $archivosAdjuntos
        ];

        try {
             // A. Notificación al administrador (Ventas)
             Mail::send('email.confirmacion_reclamo', $datosCorreo, function ($message) use ($idReclamo, $archivosAdjuntos) {
                 $message->from('ventas@amourspamiraflores.com', 'Amour Spa');
                 $message->to('ventas@amourspamiraflores.com')
                     ->subject('Nuevo Reclamo registrado - REC-' . $idReclamo);
 
                 if (!empty($archivosAdjuntos)) {
                     foreach ($archivosAdjuntos as $archivo) {
                         $rutaArchivo = str_replace('storage/', 'app/public/', $archivo['ruta']);
                         $message->attach(storage_path($rutaArchivo), [
                             'as' => $archivo['nombre_original'],
                             'mime' => $archivo['mime_type']
                         ]);
                     }
                 }
             });
 
             // B. Notificación de confirmación al CLIENTE
             Mail::send('email.confirmacion_reclamo', $datosCorreo, function ($message) use ($validated, $idReclamo) {
                 $message->from('ventas@amourspamiraflores.com', 'Amour Spa');
                 $message->to($validated['email'])
                     ->subject('Hemos recibido tu solicitud - Amour Spa (REC-' . $idReclamo . ')');
             });
            Log::info('EMAIL_RECLAMO_EXITO: Correos enviados para REC-' . $idReclamo . ' (Admin y Cliente ' . $validated['email'] . ')');

        } catch (\Exception $e) {
            Log::error('Error al enviar emails de reclamo: ' . $e->getMessage());
        }

        // 5. Redireccionar con 茅xito
        return redirect()->back()->with([
            'success_reclamo' => 'Reclamo registrado exitosamente',
            'numero_reclamo' => 'REC-' . $idReclamo
        ]);
    }
}
