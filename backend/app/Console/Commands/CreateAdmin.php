<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin';

    protected $description = 'Create an administrator account';

    public function handle(): int
    {
        $name = $this->ask('Nama admin');
        $email = $this->ask('Email admin');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Format email tidak valid.');
            return self::FAILURE;
        }

        if (User::where('email', $email)->exists()) {
            $this->error('Email sudah digunakan.');
            return self::FAILURE;
        }

        $password = $this->secret('Password admin (minimal 12 karakter)');
        $confirmation = $this->secret('Ulangi password admin');

        if (
            !$password ||
            strlen($password) < 12 ||
            $password !== $confirmation
        ) {
            $this->error('Password tidak valid atau konfirmasi tidak cocok.');
            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
        ]);

        $this->info('Akun admin berhasil dibuat.');
        $this->line('Email: ' . $user->email);

        return self::SUCCESS;
    }
}
