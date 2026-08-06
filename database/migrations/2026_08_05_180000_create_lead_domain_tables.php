<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('businesses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('external_id')->nullable()->index();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('city')->default('Алматы');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('website')->nullable();
            $table->string('website_domain')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('phone_normalized')->nullable()->index();
            $table->json('social_links')->nullable();
            $table->string('status')->default('lead')->index();
            $table->string('fingerprint', 64)->nullable()->index();
            $table->string('source')->default('csv_import');
            $table->string('source_url')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('ignored_at')->nullable();
            $table->string('ignore_reason')->nullable();
            $table->timestamps();

            $table->unique(['source', 'external_id']);
        });

        Schema::create('import_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('original_filename');
            $table->string('stored_path');
            $table->string('status')->default('pending')->index();
            $table->json('column_map')->nullable();
            $table->json('headers')->nullable();
            $table->json('preview_rows')->nullable();
            $table->json('stats')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('import_rows', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('import_run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('row_number');
            $table->json('raw_data');
            $table->string('status')->default('pending')->index();
            $table->string('message')->nullable();
            $table->timestamps();

            $table->index(['import_run_id', 'row_number']);
        });

        Schema::create('outreach_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel')->default('whatsapp');
            $table->string('status')->default('pending')->index();
            $table->json('payload')->nullable();
            $table->json('provider_response')->nullable();
            $table->timestamp('attempted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_attempts');
        Schema::dropIfExists('import_rows');
        Schema::dropIfExists('import_runs');
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('categories');
    }
};
