<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    /**
     * Champs autorisés à l'assignation massive.
     */
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'priority',
    ];

    /**
     * Valeurs par défaut.
     */
    protected $attributes = [
        'priority' => 'moyenne',
        'content'  => null,
    ];

    /**
     * Une note appartient à un utilisateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}