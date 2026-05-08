<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Note;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Utilisateur de test ---
        $user = User::updateOrCreate(
            ['email' => 'test@noteflow.com'],
            ['name'     => 'Utilisateur Test', 'password' => Hash::make('password123')]
        );

        // --- Notes d'exemple (triées par priorité) ---
        $notes = [
            [
                'title'    => 'Rendre le projet Laravel + React',
                'content'  => 'Finaliser l\'API REST, tester les routes avec Postman, et rédiger le compte rendu PDF (4-6 pages).',
                'priority' => 'haute',
            ],
            [
                'title'    => 'Réviser les hooks React',
                'content'  => 'Revoir useState, useEffect et useContext. Pratiquer avec des exemples concrets.',
                'priority' => 'haute',
            ],
            [
                'title'    => 'Lire la documentation Laravel Sanctum',
                'content'  => 'Comprendre la gestion des tokens et la configuration CORS pour les API SPA.',
                'priority' => 'moyenne',
            ],
            [
                'title'    => 'Préparer l\'environnement de développement',
                'content'  => 'Installer PHP 8.2, Composer, Node.js, et configurer le fichier .env.',
                'priority' => 'moyenne',
            ],
            [
                'title'    => 'Idées de fonctionnalités bonus',
                'content'  => 'Filtre par priorité, recherche plein texte, export PDF, partage de notes.',
                'priority' => 'basse',
            ],
        ];

        foreach ($notes as $noteData) {
            Note::create(array_merge($noteData, ['user_id' => $user->id]));
        }
    }
}