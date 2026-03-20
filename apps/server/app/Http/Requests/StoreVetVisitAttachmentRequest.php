<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\VetVisit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVetVisitAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var VetVisit $visit */
        $visit = $this->route('vet_visit');

        return $this->user()->can('update', $visit);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'attachment' => ['required', 'file', 'mimes:jpeg,png,webp,pdf', 'max:10240'],
        ];
    }
}
