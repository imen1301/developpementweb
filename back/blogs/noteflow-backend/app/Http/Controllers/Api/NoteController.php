<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class NoteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * GET /api/notes - Liste des notes de l'utilisateur connecté
     */
    public function index()
    {
        $notes = Auth::user()->notes()->latest()->get();
        return response()->json(['notes' => $notes]);
    }

    /**
     * POST /api/notes - Créer une nouvelle note
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:100',
            'content'  => 'nullable|string',
            'priority' => 'in:basse,moyenne,haute',
        ]);

        $note = Auth::user()->notes()->create($validated);

        return response()->json($note, 201);
    }

    /**
     * PUT /api/notes/{id} - Modifier une note
     */
    public function update(Request $request, Note $note)
    {
        // Chercher la note uniquement dans les notes de l'utilisateur connecté.
        // Si elle n'existe pas (ou n'appartient pas à l'utilisateur), on renvoie 404.
        $note = Auth::user()->notes()->find($note->id);

        if (!$note) {
            return response()->json(['message' => 'Note introuvable'], 404);
        }

        $validated = $request->validate([
            'title'    => 'required|string|max:100',
            'content'  => 'nullable|string',
            'priority' => 'in:basse,moyenne,haute',
        ]);

        $note->update($validated);

        return response()->json($note);
    }

    /**
     * DELETE /api/notes/{id} - Supprimer une note
     */
    public function destroy($id)
{
    $note = Note::where('id', $id)
                ->where('user_id', auth()->id())
                ->first();

    if (!$note) {
        return response()->json(['message' => 'Note introuvable'], 404);
    }

    $note->delete();

    return response()->json(['message' => 'Note supprimée']);
}
}
