<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\FoodStockItem;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// TODO: Re-add `implements ShouldQueue` + `use Queueable` + `$this->onQueue('notifications')`
//       once Laravel Cloud supports queue workers. Removed temporarily because queued jobs
//       sit in the jobs table unprocessed without a running worker.
class CriticalStockNotification extends Notification
{
    public function __construct(
        public readonly FoodStockItem $stockItem,
        public readonly string $productName,
        public readonly int $daysRemaining,
        public readonly ?string $runsOutDate,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'critical_stock',
            'title' => "URGENT: {$this->productName} critically low",
            'food_stock_item_id' => $this->stockItem->id,
            'food_product_id' => $this->stockItem->food_product_id,
            'product_name' => $this->productName,
            'days_remaining' => $this->daysRemaining,
            'runs_out_date' => $this->runsOutDate,
            'urgency' => 'high',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("URGENT: {$this->productName} critically low")
            ->markdown('notifications.critical-stock', [
                'stockItem' => $this->stockItem,
                'productName' => $this->productName,
                'daysRemaining' => $this->daysRemaining,
                'runsOutDate' => $this->runsOutDate,
            ]);
    }
}
