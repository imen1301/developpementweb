<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Créer la table notes.
     * Exécuter : php artisan migrate
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();                                                // PK auto-increment
            $table->foreignId('user_id')->constrained()->onDelete('cascade');                                 // FK vers users, suppression en cascade
            $table->string('title', 100);                               // Titre obligatoire, max 100 car.
            $table->text('content')->nullable();                         // Contenu optionnel
            $table->enum('priority', ['basse', 'moyenne', 'haute'])->default('moyenne');                                  // Niveau de priorité
            $table->timestamps();                                        // created_at + updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};