<?php

namespace App\Models;
// https://techsolutionstuff.com/post/laravel-10-socialite-login-with-google-account
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// use Laravel\Sanctum\HasApiTokens; // No se usa Sanctum; auth con JWT
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject,MustVerifyEmail
{
    use HasFactory, Notifiable; // HasApiTokens (Sanctum) retirado

    //======= jorge
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    //=====================
   
    protected $fillable = [
        'name',
        'email',
        'password',
        
        'avatar',
        'Activo',
        'es_administrador_principal',
        'google_id',
        'microsoft_id',
        'is_email_verified',
        
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

     protected $casts = [
        'es_administrador_principal' => 'boolean',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function ratings()
    {
        return $this->hasMany(ProductUserRating::class, 'id_usuario', 'id');
    }

    public function campusProyectos()
    {
        return $this->belongsToMany(
            CampusProyecto::class,
            'campus_cliente_proyecto',
            'id_user',
            'id_proyecto',
            'id',
            'id_proyecto'
        );
    }

    public function campusClienteRecord()
    {
        return $this->hasOne(CampusCliente::class, 'id_user', 'id');
    }
}
