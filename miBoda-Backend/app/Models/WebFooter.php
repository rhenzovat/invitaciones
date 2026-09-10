<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebFooter extends Model
{
    use HasFactory;

    protected $table = 'web_footer';
    protected $primaryKey = 'id_footer';
    protected $guarded = [];
    
}