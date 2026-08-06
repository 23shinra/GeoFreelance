<?php

declare(strict_types=1);

namespace App\Services\Businesses;

final readonly class WhatsappLinkBuilder
{
    public function __construct(
        private PhoneNormalizer $phoneNormalizer,
    ) {}

    /**
     * Build a wa.me deep link with a prefilled first message.
     */
    public function build(?string $phone, ?string $businessName = null): ?string
    {
        $digits = $this->digits($phone);

        if ($digits === null) {
            return null;
        }

        $url = 'https://wa.me/'.$digits;
        $message = $this->message($businessName);

        return $message === null
            ? $url
            : $url.'?text='.rawurlencode($message);
    }

    private function digits(?string $phone): ?string
    {
        $normalized = $this->phoneNormalizer->normalize($phone);

        if ($normalized === null) {
            return null;
        }

        return ltrim($normalized, '+');
    }

    private function message(?string $businessName): ?string
    {
        $template = trim((string) config('leads.whatsapp.message_template'));

        if ($template === '') {
            return null;
        }

        return str_replace(':name', trim((string) $businessName), $template);
    }
}
