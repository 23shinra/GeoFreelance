<?php

declare(strict_types=1);

namespace App\Services\Outreach;

use App\Contracts\OutreachGateway;
use App\Enums\OutreachAttemptStatus;
use App\Models\Business;
use App\Models\OutreachAttempt;
use App\Models\User;

/**
 * Safe stub for ChatAgents. Records the intent without sending messages.
 */
final readonly class NullOutreachGateway implements OutreachGateway
{
    public function name(): string
    {
        return 'null';
    }

    public function startConversation(Business $business, User $user, array $payload = []): OutreachAttempt
    {
        return OutreachAttempt::query()->create([
            'business_id' => $business->id,
            'user_id' => $user->id,
            'channel' => 'whatsapp',
            'status' => OutreachAttemptStatus::Pending,
            'payload' => [
                ...$payload,
                'gateway' => $this->name(),
                'note' => 'ChatAgents adapter is not connected yet.',
            ],
            'provider_response' => [
                'ok' => false,
                'message' => 'Stub gateway: conversation was queued locally only.',
            ],
            'attempted_at' => now(),
        ]);
    }
}
