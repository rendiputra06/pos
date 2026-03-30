<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class GlobalActivityLogger
{
    public function created(Model $model)
    {
        $this->logActivity('created', $model);
    }

    public function updated(Model $model)
    {
        $this->logActivity('updated', $model, $model->getChanges());
    }

    public function deleted(Model $model)
    {
        $this->logActivity('deleted', $model);
    }

    protected function logActivity(string $action, Model $model, array $properties = [])
    {
        // Hindari log untuk tabel activity_log itu sendiri
        if ($model->getTable() === 'activity_log') return;

        activity('global')
            ->causedBy(Auth::user())
            ->performedOn($model)
            ->withProperties($properties ?: $model->getAttributes())
            ->tap(function($activity) {
                if (Auth::check()) {
                    $activity->store_id = Auth::user()->store_id;
                }
            })
            ->log("{$action} " . class_basename($model));
    }
}
