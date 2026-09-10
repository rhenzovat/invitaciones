<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\CmsStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\VendedorResource;
use App\Models\WebFooter;
use App\Models\WebHeader;
use App\Support\SparlexPageData;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WebFooterController extends Controller
{
    private const FOOTER_IMAGE_DIR = 'storage_/footer';
    /**
     * URLs absolutas para el panel admin (SPA en otro puerto no puede adivinar la ruta pública solo con la ruta relativa).
     */
    protected function footerPayloadWithLogoUrls(array $attrs): array
    {
        $menu = ! empty($attrs['logo_menu']) ? (string) $attrs['logo_menu'] : null;
        $foot = ! empty($attrs['logo_footer']) ? (string) $attrs['logo_footer'] : null;

        $attrs['logo_menu_url'] = CmsStorageUrl::forApi($menu);
        $attrs['logo_footer_url'] = CmsStorageUrl::forApi($foot);
        $attrs['url_imagen_central_url'] = CmsStorageUrl::forApi(
            ! empty($attrs['url_imagen_central']) ? (string) $attrs['url_imagen_central'] : null
        );
        $attrs['url_qr_url'] = CmsStorageUrl::forApi(
            ! empty($attrs['url_qr']) ? (string) $attrs['url_qr'] : null
        );

        return $this->footerPayloadWithLists($attrs);
    }

    /**
     * Normaliza listas JSON del footer para el admin y la vista pública.
     */
    protected function footerPayloadWithLists(array $attrs): array
    {
        if (!empty($attrs['footer_redes']) && is_string($attrs['footer_redes'])) {
            $decoded = json_decode($attrs['footer_redes'], true);
            $attrs['footer_redes'] = is_array($decoded) ? $decoded : [];
        }
        if (!isset($attrs['footer_redes']) || !is_array($attrs['footer_redes'])) {
            $attrs['footer_redes'] = [];
        } else {
            $attrs['footer_redes'] = SparlexPageData::normalizeRedesList($attrs['footer_redes']);
        }

        if (!empty($attrs['footer_bullets']) && is_string($attrs['footer_bullets'])) {
            $decoded = json_decode($attrs['footer_bullets'], true);
            $attrs['footer_bullets'] = is_array($decoded) ? $decoded : [];
        }
        if (!isset($attrs['footer_bullets']) || !is_array($attrs['footer_bullets'])) {
            $attrs['footer_bullets'] = [];
        }

        if (!empty($attrs['nav_footer']) && is_string($attrs['nav_footer'])) {
            $decoded = json_decode($attrs['nav_footer'], true);
            $attrs['nav_footer'] = is_array($decoded) ? $decoded : [];
        }

        return $attrs;
    }

    protected function syncGlobalRedes(array $redes): void
    {
        $normalized = SparlexPageData::normalizeRedesList($redes);
        if (Schema::hasTable('web_header')) {
            WebHeader::where('id_header', 1)->update([
                'redes_side' => $normalized,
                'updated_at' => now(),
            ]);
        }
    }

    protected function encodeFooterRedes($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_string($value)) {
            return $value;
        }
        if (is_array($value)) {
            return json_encode(SparlexPageData::normalizeRedesList($value), JSON_UNESCAPED_UNICODE);
        }

        return null;
    }

    protected function encodeFooterNavFooter($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_string($value)) {
            return $value;
        }
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return null;
    }
    protected function filterFooterColumns(array $data): array
    {
        return array_filter(
            $data,
            static fn ($value, $key) => Schema::hasColumn('web_footer', (string) $key),
            ARRAY_FILTER_USE_BOTH
        );
    }

    protected function clampFooterUrlWhatsapp(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }

        $max = 500;
        if (Schema::hasColumn('web_footer', 'url_whatsapp')) {
            try {
                $column = DB::selectOne(
                    'SELECT CHARACTER_MAXIMUM_LENGTH AS len
                     FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE()
                       AND TABLE_NAME = ?
                       AND COLUMN_NAME = ?',
                    ['web_footer', 'url_whatsapp']
                );
                if ($column && $column->len !== null) {
                    $max = (int) $column->len;
                }
            } catch (\Throwable) {
                // Mantener 500 por defecto.
            }
        }

        return strlen($url) > $max ? substr($url, 0, $max) : $url;
    }


    /**
     * @OA\Get(
     *     path="/web_footer/obtener",
     *     tags={"Sitio Web"},
     *     summary="Obtener configuración de footer por ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="query", required=true, @OA\Schema(type="integer"), example=1),
     *     @OA\Response(response=200, description="Configuración encontrada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse")),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function obtener(Request $request) : JsonResponse
    {
        $id = $request->id;
        $rows = DB::select('select * from web_footer where id_footer = ?', [$id]);
        $result = array_map(
            fn ($row) => $this->footerPayloadWithLogoUrls((array) $row),
            $rows
        );

        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result,
        ]);
    }
    /**
     * @OA\Get(
     *     path="/web_footer/listar",
     *     tags={"Sitio Web"},
     *     summary="Listar configuraciones de footer",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de configuraciones", @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse"))
     * )
     */
    public function listar()
    {
        $result = WebFooter::orderBy('id_footer', 'DESC')
            ->get()
            ->map(fn (WebFooter $m) => $this->footerPayloadWithLogoUrls($m->toArray()))
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/web_footer/crear",
     *     tags={"Sitio Web"},
     *     summary="Crear nueva configuración de footer",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"nombre","Activo"},
     *         @OA\Property(property="nombre", type="string"),
     *         @OA\Property(property="Activo", type="string", enum={"S","N"})
     *     )),
     *     @OA\Response(response=200, description="Configuración creada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    public function crear(Request $request) : JsonResponse
    {
        // Log::channel('stderr')->info($request->Activo);
		$result = WebFooter::create([
                    'nombre'          => $request->nombre,
                    'created_at'      => date("Y-m-d H:i:s"),
                    'updated_at'      => date("Y-m-d H:i:s"),
                    'Activo'          => $request->Activo,
            
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Registro insertado',
            'result' =>  $result
        ]);
    }

    /**
     * @OA\Put(
     *     path="/web_footer/actualizar",
     *     tags={"Sitio Web"},
     *     summary="Actualizar configuración de footer existente",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"id_footer"},
     *         @OA\Property(property="id_footer", type="integer", example=1),
     *         @OA\Property(property="nuestros_horarios", type="string"),
     *         @OA\Property(property="sobre_la_empresa", type="string"),
     *         @OA\Property(property="red_social_facebook", type="string"),
     *         @OA\Property(property="red_social_youtobe", type="string"),
     *         @OA\Property(property="red_social_twitter", type="string"),
     *         @OA\Property(property="red_social_instagram", type="string"),
     *         @OA\Property(property="red_social_linkedin", type="string"),
     *         @OA\Property(property="contacto_direccion", type="string"),
     *         @OA\Property(property="contacto_telefono", type="string"),
     *         @OA\Property(property="contacto_email", type="string"),
     *         @OA\Property(property="url_mapa", type="string"),
     *         @OA\Property(property="Activo", type="string", enum={"S","N"})
     *     )),
     *     @OA\Response(response=200, description="Configuración actualizada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    /**
     * Guarda en public/storage_/footer/{baseName}.{ext} — misma carpeta que el tema público.
     */
    private function storeFooterPublicImage(UploadedFile $file, string $baseName, ?string $oldPath = null): string
    {
        if (! $file->isValid()) {
            throw new \RuntimeException('Archivo de imagen inválido');
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        if ($ext === 'jpeg' || $ext === 'jfif') {
            $ext = 'jpg';
        }
        if (! in_array($ext, ['jpg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'], true)) {
            $mime = $file->getMimeType() ?: '';
            $ext = match (true) {
                str_contains($mime, 'png') => 'png',
                str_contains($mime, 'gif') => 'gif',
                str_contains($mime, 'webp') => 'webp',
                str_contains($mime, 'svg') => 'svg',
                default => 'jpg',
            };
        }

        $relativePath = self::FOOTER_IMAGE_DIR . '/' . $baseName . '.' . $ext;
        $directory = public_path(self::FOOTER_IMAGE_DIR);

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $this->deletePublicImage($oldPath);
        $this->deleteFooterImageVariants($baseName, $ext);

        $file->move($directory, $baseName . '.' . $ext);

        if (! is_file(public_path($relativePath))) {
            throw new \RuntimeException('No se pudo guardar la imagen del footer en ' . $relativePath);
        }

        Log::info('[WebFooter::storeFooterPublicImage] guardado', ['path' => $relativePath]);

        return $relativePath;
    }

    private function saveBase64FooterImage(?string $base64, string $baseName, ?string $oldPath = null): ?string
    {
        if (! $base64) {
            return null;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
            $ext = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            $data = substr($base64, strpos($base64, ',') + 1);
        } else {
            $ext = 'jpg';
            $data = $base64;
        }

        if ($ext === 'jfif') {
            $ext = 'jpg';
        }

        $decoded = base64_decode($data, true);
        if ($decoded === false) {
            return null;
        }

        $relativePath = self::FOOTER_IMAGE_DIR . '/' . $baseName . '.' . $ext;
        $directory = public_path(self::FOOTER_IMAGE_DIR);

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $this->deletePublicImage($oldPath);
        $this->deleteFooterImageVariants($baseName, $ext);

        if (file_put_contents(public_path($relativePath), $decoded) === false) {
            return null;
        }

        return $relativePath;
    }

    private function deleteFooterImageVariants(string $baseName, string $keepExt): void
    {
        foreach (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'] as $ext) {
            if ($ext === $keepExt || ($keepExt === 'jpg' && $ext === 'jpeg')) {
                continue;
            }
            $this->deletePublicImage(self::FOOTER_IMAGE_DIR . '/' . $baseName . '.' . $ext);
        }
    }

    private function deletePublicImage(?string $path): void
    {
        if (empty($path) || preg_match('#^https?://#i', $path)) {
            return;
        }

        $normalized = ltrim(str_replace('\\', '/', trim($path)), '/');
        if ($normalized === '') {
            return;
        }

        if (Storage::disk('public_imagenes')->exists($normalized)) {
            Storage::disk('public_imagenes')->delete($normalized);
        }
    }

    /**
     * Subida de logos por multipart (evita JSON gigante en base64 que tumba PHP/sesión).
     */
    public function actualizar_logos(Request $request): JsonResponse
    {
        $request->validate([
            'id_footer'      => 'required|integer|exists:web_footer,id_footer',
            'logo_menu'      => 'nullable|image|mimes:jpg,jpeg,jfif,png,gif,webp,svg,bmp,avif|max:5120',
            'logo_footer'    => 'nullable|image|mimes:jpg,jpeg,jfif,png,gif,webp,svg,bmp,avif|max:5120',
            'imagen_central' => 'nullable|image|mimes:jpg,jpeg,jfif,png,gif,webp,svg,bmp,avif|max:8192',
            'qr'             => 'nullable|image|mimes:jpg,jpeg,jfif,png,gif,webp,svg,bmp,avif|max:5120',
        ]);

        $id = (int) $request->input('id_footer');
        $row = WebFooter::find($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado', 'result' => null], 404);
        }

        DB::beginTransaction();
        try {
            $data = ['updated_at' => date('Y-m-d H:i:s')];

            if ($request->hasFile('logo_menu')) {
                $data['logo_menu'] = $this->storeFooterPublicImage(
                    $request->file('logo_menu'),
                    'logo-header',
                    $row->logo_menu
                );
            }

            if ($request->hasFile('logo_footer')) {
                $data['logo_footer'] = $this->storeFooterPublicImage(
                    $request->file('logo_footer'),
                    'logo-footer',
                    $row->logo_footer
                );
            }

            if ($request->hasFile('imagen_central')) {
                $data['url_imagen_central'] = $this->storeFooterPublicImage(
                    $request->file('imagen_central'),
                    'footer-central',
                    $row->url_imagen_central
                );
            }

            if ($request->hasFile('qr') && Schema::hasColumn('web_footer', 'url_qr')) {
                $data['url_qr'] = $this->storeFooterPublicImage(
                    $request->file('qr'),
                    'footer-qr',
                    $row->url_qr
                );
            }

            if (count($data) > 1) {
                WebFooter::where('id_footer', $id)->update($this->filterFooterColumns($data));
            }
            DB::commit();

            $fresh = WebFooter::find($id);

            return response()->json([
                'success' => true,
                'message' => 'Logos actualizados',
                'result' => $fresh ? $this->footerPayloadWithLogoUrls($fresh->toArray()) : null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[WebFooter::actualizar_logos]', ['message' => $e->getMessage()]);

            return response()->json(['success' => false, 'message' => 'Error al subir logos', 'result' => null], 500);
        }
    }

    public function actualizar(Request $request) : JsonResponse
    {
        Log::info('[WebFooter::actualizar] REQUEST RECIBIDA', [
            'ip'             => $request->ip(),
            'user_id'        => optional($request->user())->id,
            'id_footer'      => $request->input('id_footer'),
            'has_logo_menu'  => ! empty($request->input('logo_menu_base64')),
            'has_logo_footer'=> ! empty($request->input('logo_footer_base64')),
            'content_type'   => $request->header('Content-Type'),
        ]);

        try {
            $request->validate([
                'id_footer' => 'required|integer|exists:web_footer,id_footer',
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            Log::error('[WebFooter::actualizar] VALIDATION FAILED', ['errors' => $ve->errors()]);
            throw $ve;
        }

        Log::info('[WebFooter::actualizar] VALIDACION OK, id_footer=' . $request->input('id_footer'));

        $id  = (int) $request->input('id_footer');
        $row = WebFooter::find($id);

        if (! $row) {
            Log::warning('[WebFooter::actualizar] REGISTRO NO ENCONTRADO id_footer=' . $id);
            return response()->json(['success' => false, 'message' => 'Registro no encontrado', 'result' => null], 404);
        }

        DB::beginTransaction();

        try {
            $telefono     = $request->input('contacto_telefono');
            $telefonoNorm = $telefono !== null && $telefono !== ''
                ? str_replace(' ', '', trim((string) $telefono))
                : null;
            $telefonoSec  = $request->input('contacto_telefono_secundario');
            $telefonoSecNorm = $telefonoSec !== null && $telefonoSec !== ''
                ? str_replace(' ', '', trim((string) $telefonoSec))
                : null;

            $data = ['updated_at' => date('Y-m-d H:i:s')];
            $textFields = [
                'nuestros_horarios', 'sobre_la_empresa', 'descripcion_footer',
                'red_social_facebook', 'red_social_youtobe', 'red_social_twitter',
                'red_social_instagram', 'red_social_linkedin', 'red_social_tiktok',
                'contacto_direccion', 'contacto_email', 'url_mapa', 'url_whatsapp', 'whatsapp_mensaje',
                'footer_cta_subtitulo', 'footer_cta_titulo', 'Activo',
                'titulo_sobre_nosotros', 'etiqueta_redes', 'titulo_llamanos',
                'titulo_escribenos', 'titulo_ubicacion', 'footer_telefonos',
                'footer_emails', 'texto_copyright', 'nav_footer', 'footer_horario_titulo',
                'footer_redes_titulo', 'footer_redes_subtitulo',
                'promo_texto',
            ];
            foreach ($textFields as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request->input($field);
                }
            }
            if ($request->has('footer_redes')) {
                $data['footer_redes'] = $this->encodeFooterRedes($request->input('footer_redes'));
            }
            if ($request->has('footer_bullets')) {
                $data['footer_bullets'] = $this->encodeFooterRedes($request->input('footer_bullets'));
            }
            if ($request->has('nav_footer')) {
                $data['nav_footer'] = $this->encodeFooterNavFooter($request->input('nav_footer'));
            }
            if ($request->has('footer_telefonos')) {
                $lineas = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string) $request->input('footer_telefonos')))));
                if (count($lineas) > 0) {
                    $data['contacto_telefono'] = str_replace(' ', '', $lineas[0]);
                }
            }
            if ($request->has('footer_emails')) {
                $mails = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string) $request->input('footer_emails')))));
                if (count($mails) > 0) {
                    $data['contacto_email'] = $mails[0];
                }
            }
            if ($request->has('contacto_telefono')) {
                $data['contacto_telefono'] = $telefonoNorm;
            }
            if ($request->has('contacto_email')) {
                $data['contacto_email'] = $request->input('contacto_email');
            }

            if ($request->has('whatsapp_mensaje') || $request->has('contacto_telefono') || $request->has('footer_telefonos')) {
                $merged = (object) array_merge($row->toArray(), $data);
                $data['url_whatsapp'] = $this->clampFooterUrlWhatsapp(\Helpers::whatsappUrl($merged));
            }
            if ($request->has('contacto_telefono_secundario')) {
                $data['contacto_telefono_secundario'] = $telefonoSecNorm;
            }

            // ── Logo menú (base64) ────────────────────────────────────────────
            $logoMenuB64 = $request->input('logo_menu_base64');
            if ($logoMenuB64) {
                Log::info('[WebFooter::actualizar] Procesando logo_menu base64');
                $saved = $this->saveBase64FooterImage($logoMenuB64, 'logo-header', $row->logo_menu);
                if ($saved) {
                    $data['logo_menu'] = $saved;
                    Log::info('[WebFooter::actualizar] logo_menu guardado: ' . $saved);
                }
            }

            // ── Logo footer (base64) ──────────────────────────────────────────
            $logoFooterB64 = $request->input('logo_footer_base64');
            if ($logoFooterB64) {
                Log::info('[WebFooter::actualizar] Procesando logo_footer base64');
                $saved = $this->saveBase64FooterImage($logoFooterB64, 'logo-footer', $row->logo_footer);
                if ($saved) {
                    $data['logo_footer'] = $saved;
                    Log::info('[WebFooter::actualizar] logo_footer guardado: ' . $saved);
                }
            }

            WebFooter::where('id_footer', $id)->update($this->filterFooterColumns($data));
            if ($request->has('footer_redes')) {
                $decoded = json_decode($data['footer_redes'] ?? '[]', true);
                $this->syncGlobalRedes(is_array($decoded) ? $decoded : []);
            }
            DB::commit();

            Log::info('[WebFooter::actualizar] ACTUALIZADO CORRECTAMENTE id_footer=' . $id);

            $fresh = WebFooter::find($id);

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado',
                'result'  => $fresh ? $this->footerPayloadWithLogoUrls($fresh->toArray()) : null,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[WebFooter::actualizar] EXCEPCION', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);
            $hint = config('app.debug') ? $e->getMessage() : 'Error al actualizar';
            return response()->json(['success' => false, 'message' => $hint, 'result' => null], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/web_footer/eliminar",
     *     tags={"Sitio Web"},
     *     summary="Eliminar configuración de footer",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"id"},
     *         @OA\Property(property="id", type="integer", example=1)
     *     )),
     *     @OA\Response(response=200, description="Configuración eliminada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    public function eliminar(Request $request) : JsonResponse
    {
        $id = $request->input('id');
        $result = WebFooter::where('id_footer',$id)->delete();
 
        return response()->json([
            'success' => true,
           'message' => 'Registro eliminado!',
            'result'  => $result
        ]);
    }


    /**
     * @OA\Get(
     *     path="/web_footer/obtener_document",
     *     tags={"Sitio Web"},
     *     summary="Obtener documento legal del footer (Términos, etc.)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id_footer_terminos", in="query", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Documento obtenido", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    public function obtener_document(Request $request) : JsonResponse
    {
        $id = $request->id_footer_terminos;
        $result = DB::select('select * from web_terminos where id_footer_document = ?', [$id]);
        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result
        ]);
    }

    /**
     * @OA\Put(
     *     path="/web_footer/actualizar_document",
     *     tags={"Sitio Web"},
     *     summary="Actualizar documento legal del footer",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"id_footer_document","titulo","descripcion","Activo"},
     *         @OA\Property(property="id_footer_document", type="integer"),
     *         @OA\Property(property="titulo", type="string"),
     *         @OA\Property(property="descripcion", type="string"),
     *         @OA\Property(property="Activo", type="string", enum={"S","N"})
     *     )),
     *     @OA\Response(response=200, description="Documento actualizado", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    public function actualizar_document(Request $request) : JsonResponse
    {
        // Log::channel('stderr')->info($request->titulo);
        DB::beginTransaction();
        
        try {
            $id_footer_document = $request->input('id_footer_document');
          
            $result = DB::select('UPDATE web_terminos SET titulo = ?, descripcion =?, Activo = ? WHERE `id_footer_document` = ?', [
                $request->titulo,
                $request->descripcion,
                $request->Activo,
                $id_footer_document,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            DB::rollback();
            // something went wrong
        }
       
        return response()->json([
            'success' => true,
            'message' => 'Actualizado correctamente',
            'result'  => $result
        ]);
    }

}