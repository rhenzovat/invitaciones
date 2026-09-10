<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebAbout extends Model
{
    use HasFactory;

    protected $table = 'web_about';
    protected $primaryKey = 'id_about';
    protected $guarded = [];
    
}