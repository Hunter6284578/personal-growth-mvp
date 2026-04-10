<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

class CagedSheep_Security_Totp
{
    public static function verifyCode(string $secret, string $code, int $window = 1): bool
    {
        $secretBin = self::base32Decode($secret);
        if ($secretBin === false) {
            return false;
        }

        $code = preg_replace('/\D/', '', $code);
        if ($code === null || strlen($code) !== 6) {
            return false;
        }

        $timeSlice = (int) floor(time() / 30);
        for ($i = -$window; $i <= $window; $i++) {
            if (hash_equals(self::generateCode($secretBin, $timeSlice + $i), $code)) {
                return true;
            }
        }

        return false;
    }

    private static function generateCode(string $secret, int $timeSlice): string
    {
        $time = pack('N*', 0) . pack('N*', $timeSlice);
        $hmac = hash_hmac('sha1', $time, $secret, true);
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $value = unpack('N', substr($hmac, $offset, 4))[1] & 0x7FFFFFFF;
        return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
    }

    private static function base32Decode(string $b32)
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $b32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $b32) ?? '');
        if ($b32 === '') {
            return false;
        }

        $bits = '';
        for ($i = 0, $len = strlen($b32); $i < $len; $i++) {
            $val = strpos($alphabet, $b32[$i]);
            if ($val === false) {
                return false;
            }
            $bits .= str_pad(decbin($val), 5, '0', STR_PAD_LEFT);
        }

        $out = '';
        $byteLen = (int) floor(strlen($bits) / 8);
        for ($i = 0; $i < $byteLen; $i++) {
            $out .= chr(bindec(substr($bits, $i * 8, 8)));
        }

        return $out;
    }
}
