<?php

declare(strict_types=1);

namespace App\Http\Requests\Businesses;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateBusinessStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, list<\Illuminate\Validation\Rules\In|string>>
     */
    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['lead', 'ignore', 'restore'])],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
