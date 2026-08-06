<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BusinessStatus;
use App\Http\Requests\Businesses\UpdateBusinessStatusRequest;
use App\Http\Resources\BusinessCardResource;
use App\Models\Business;
use App\Models\Category;
use App\Services\Businesses\BusinessStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessStatusService $statusService,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $categoryId = $request->integer('category_id') ?: null;
        $search = trim($request->string('search')->toString());
        $view = $request->string('view')->toString();

        $businesses = Business::query()
            ->with('category:id,name')
            ->when($view === 'ignored', fn ($q) => $q->ignored())
            ->when($view === 'checked', fn ($q) => $q->whereNotNull('last_checked_at'))
            ->when(
                $view === '' && $status !== '' && BusinessStatus::tryFrom($status) !== null,
                fn ($q) => $q->where('status', $status),
            )
            ->when($view === '' && $status === '', fn ($q) => $q->where('status', BusinessStatus::Lead))
            ->when($categoryId !== null, fn ($q) => $q->where('category_id', $categoryId))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($inner) use ($search): void {
                    $inner
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('address', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('website_domain', 'like', '%'.$search.'%');
                });
            })
            ->latest('updated_at')
            ->paginate(20)
            ->withQueryString()
            ->through(static fn (Business $business): array => (new BusinessCardResource($business))
                ->resolve());

        return Inertia::render('businesses/index', [
            'businesses' => $businesses,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'status' => $status,
                'category_id' => $categoryId,
                'search' => $search,
                'view' => $view,
            ],
        ]);
    }

    public function updateStatus(
        UpdateBusinessStatusRequest $request,
        Business $business,
    ): RedirectResponse {
        $action = $request->string('action')->toString();

        match ($action) {
            'lead' => $this->statusService->markAsLead($business),
            'ignore' => $this->statusService->ignoreManual($business, $request->string('reason')->toString() ?: null),
            'restore' => $this->statusService->restore($business),
            default => null,
        };

        return back()->with('success', 'Статус бизнеса обновлён.');
    }
}
