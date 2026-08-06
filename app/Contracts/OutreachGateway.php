<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Business;
use App\Models\OutreachAttempt;
use App\Models\User;

/**
 * Future adapter for ChatAgents / WhatsApp outreach.
 */
interface OutreachGateway
{
    public function name(): string;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function startConversation(Business $business, User $user, array $payload = []): OutreachAttempt;
}
