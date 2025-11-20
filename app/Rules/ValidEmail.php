<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidEmail implements ValidationRule
{
    /**
     * Regex that enforces an email with a top-level domain.
     */
    private const PATTERN = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/i';

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('El correo electrónico debe ser texto.');

            return;
        }

        $email = trim($value);

        if (mb_strlen($email) > 255) {
            $fail('El correo electrónico no puede exceder los 255 caracteres.');

            return;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $fail('El formato del correo electrónico no es válido.');

            return;
        }

        if (! preg_match(self::PATTERN, $email)) {
            $fail('El correo electrónico debe tener un dominio válido (ej: usuario@dominio.com).');
        }
    }

    /**
     * Expose the pattern so it can be reused when building inline validation rules.
     */
    public static function pattern(): string
    {
        return self::PATTERN;
    }
}
