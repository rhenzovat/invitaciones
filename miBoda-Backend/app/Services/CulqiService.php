<?php

namespace App\Services;

use Culqi\Culqi;

/**
 * CulqiService
 *
 * Encapsula toda la lógica de integración con Culqi.
 *
 * Origen de las credenciales (en este orden):
 * 1) Base de datos: tabla pago_pasarela_config (pasarela activa) vía PaymentGatewayManager::getConfig()
 * 2) Fallback: config('services.culqi.*') y .env
 *
 * Importante - Error "Ocurrieron problemas al desencriptar":
 * Las llaves RSA deben ser del MISMO entorno que la API Key. Si usas pk_test_ (integración),
 * crea la llave RSA en https://integ-panel.culqi.com (Desarrollo > RSA Keys).
 * Si usas pk_live_ (producción), usa la llave de https://mipanel.culqi.com.
 */
class CulqiService
{
    protected string $publicKey;
    protected string $secretKey;
    protected string $rsaId;
    protected string $rsaPublicKey;

    public function __construct()
    {
        // ── Leer credenciales: DB (admin panel) → config/services → .env ─
        $this->publicKey    = PaymentGatewayManager::getConfig('CULQI_PUBLIC_KEY')
                           ?? config('services.culqi.public_key',    env('CULQI_PUBLIC_KEY',    ''));
        $this->secretKey    = PaymentGatewayManager::getConfig('CULQI_SECRET_KEY')
                           ?? config('services.culqi.secret_key',    env('CULQI_SECRET_KEY',    ''));
        $rawRsaId        = PaymentGatewayManager::getConfig('CULQI_RSA_ID')
                        ?? config('services.culqi.rsa_id',        env('CULQI_RSA_ID',        ''));
        $rawRsaPublicKey = PaymentGatewayManager::getConfig('CULQI_RSA_PUBLIC_KEY')
                        ?? config('services.culqi.rsa_public_key', env('CULQI_RSA_PUBLIC_KEY', ''));

        $this->rsaId        = is_string($rawRsaId) ? trim($rawRsaId) : '';
        $this->rsaPublicKey = self::normalizeRsaPublicKey($rawRsaPublicKey);
    }

    /**
     * Normaliza la llave pública RSA para el frontend (Culqi Checkout v4).
     * Convierte \n literales en newlines reales y asegura formato PEM válido.
     */
    protected static function normalizeRsaPublicKey(?string $key): string
    {
        if ($key === null || $key === '') {
            return '';
        }
        $key = trim($key);
        // Si viene de .env o DB como "-----BEGIN...\nMIGf..." (barra-n literal), convertir a newline real
        $key = str_replace(["\r\n", "\\n", '\\n'], ["\n", "\n", "\n"], $key);
        return $key;
    }

    /**
     * Public Key para inicializar el SDK de Culqi en el frontend.
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * RSA Key ID — requerido por Culqi Checkout v4 para encriptar el payload (tarjeta y Yape).
     */
    public function getRsaId(): string
    {
        return $this->rsaId;
    }

    /**
     * RSA Public Key — requerido por Culqi Checkout v4 para encriptar el payload (tarjeta y Yape).
     * Ya normalizada con newlines correctos para el SDK JS.
     */
    public function getRsaPublicKey(): string
    {
        return $this->rsaPublicKey;
    }

    /**
     * Indica si las llaves RSA están configuradas (necesarias para que el checkout no falle con encrypt_error).
     */
    public function hasRsaConfigured(): bool
    {
        return $this->rsaId !== '' && $this->rsaPublicKey !== '';
    }

    /**
     * Genera un order ID temporal para la sesión de Culqi.
     * Culqi v4 requiere prefijo "ord_test_" en sandbox y "ord_live_" en producción.
     */
    public function generateOrderId(): string
    {
        $prefix = app()->environment('production') ? 'ord_live_' : 'ord_test_';
        return $prefix . time() . '_' . bin2hex(random_bytes(4));
    }

    /**
     * Crea un charge en Culqi con el token del cliente.
     *
     * @param array{
     *   token:         string,
     *   amount:        int,       // En céntimos
     *   email:         string,
     *   codigo_pedido: string,
     *   metadata?:     array
     * } $data
     * @return array  Datos del pago para guardar en BD
     */
    public function createCharge(array $data): array
    {
        $culqi = new Culqi([
            'api_key' => $this->secretKey,
        ]);

        $charge = $culqi->Charges->create([
            'amount'        => $data['amount'],
            'currency_code' => 'PEN',
            'email'         => $data['email'],
            'source_id'     => $data['token'],
            'description'   => 'Compra de productos - Pedido #' . $data['codigo_pedido'],
            'capture'       => true,
            'metadata'      => array_merge($data['metadata'] ?? [], [
                'codigo_pedido' => $data['codigo_pedido'],
            ]),
        ]);

        return [
            'metodo'         => 'culqi',
            'estado'         => 'completado',
            'transaccion_id' => $charge->id,
            'fecha_pago'     => now(),
            'codigo_culqi'   => $data['order_temp'] ?? null,
        ];
    }
}
