<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Business;
use App\Services\Businesses\WhatsappLinkBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Business
 */
final class BusinessCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $whatsapp = app(WhatsappLinkBuilder::class);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'phone' => $this->phone,
            'phone_normalized' => $this->phone_normalized,
            'whatsapp_url' => $whatsapp->build($this->phone_normalized ?? $this->phone, $this->name),
            'website' => $this->website,
            'social_links' => $this->social_links ?? [],
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'category' => $this->category?->name,
            'source_url' => $this->source_url,
            'ignore_reason' => $this->ignore_reason,
            'last_checked_at' => $this->last_checked_at?->toIso8601String(),
        ];
    }
}
