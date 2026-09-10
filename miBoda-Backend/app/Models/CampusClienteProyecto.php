<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusClienteProyecto extends Model
{
    use HasFactory;

    protected $table = 'campus_cliente_proyecto';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'id_user',
        'id_cliente',
        'id_proyecto',
    ];

    public function campusCliente()
    {
        return $this->belongsTo(CampusCliente::class, 'id_cliente', 'id_cliente');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }
}
