<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{

    use HasFactory;
    
    protected $table = 'services';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'service_type_id',
        'name',
        'description',
        'uom',
        'price',
        'quantity',
    ];

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }
}
