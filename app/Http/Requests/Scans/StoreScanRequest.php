<?php

declare(strict_types=1);

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

final class StoreScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'queries' => ['required', 'array', 'min:1', 'max:20'],
            'queries.*' => ['required', 'string', 'max:100', 'distinct'],
        ];
    }
}
