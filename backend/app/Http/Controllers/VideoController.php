<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;

class VideoController extends Controller
{
    public function generateToken(Request $request)
    {
        $roomName = $request->query('room', 'consultation-1');
        $participantName = $request->query('user', 'Utilisateur-' . rand(100, 999));

        // On instancie l'AccessToken avec les clés définies dans le .env
        $tokenOptions = (new AccessTokenOptions())
            ->setIdentity($participantName);

        $videoGrant = (new VideoGrant())
            ->setRoomJoin(true)
            ->setRoomName($roomName);

        $token = (new AccessToken(env('LIVEKIT_API_KEY'), env('LIVEKIT_API_SECRET')))
            ->init($tokenOptions)
            ->setGrant($videoGrant);

        return response()->json([
            'token' => $token->toJwt()
        ]);
    }
}