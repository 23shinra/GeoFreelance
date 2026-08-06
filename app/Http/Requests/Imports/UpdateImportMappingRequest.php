<?php

declare(strict_types=1);

namespace App\Http\Requests\Imports;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateImportMappingRequest extends FormRequest
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
            'column_map' => ['required', 'array'],
            'column_map.name' => ['required', 'string'],
            'column_map.category' => ['nullable', 'string'],
            'column_map.address' => ['nullable', 'string'],
            'column_map.latitude' => ['nullable', 'string'],
            'column_map.longitude' => ['nullable', 'string'],
            'column_map.phone' => ['nullable', 'string'],
            'column_map.website' => ['nullable', 'string'],
            'column_map.social_links' => ['nullable', 'string'],
            'column_map.external_id' => ['nullable', 'string'],
            'column_map.source_url' => ['nullable', 'string'],
        ];
    }
}
