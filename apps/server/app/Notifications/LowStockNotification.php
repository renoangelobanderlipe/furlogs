<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\FoodStockItem;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// TODO: Re-add `implements ShouldQueue` + `use Queueable` + `$this->onQueue('notifications')`
//       once Laravel Cloud supports queue workers. Removed temporarily because queued jobs
//       sit in the jobs table unprocessed without a running worker.
class LowStockNotification extends Notification
{
    public function __construct(
        public readonly FoodStockItem $stockItem,
        public readonly string $productName,
        public readonly int $daysRemaining,
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
            'type' => 'low_stock',
            'title' => "Food stock running low: {$this->productName}",
            'food_stock_item_id' => $this->stockItem->id,
            'food_product_id' => $this->stockItem->food_product_id,
            'product_name' => $this->productName,
            'days_remaining' => $this->daysRemaining,
            'urgency' => 'medium',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Food stock running low: {$this->productName}")
            ->markdown('notifications.low-stock', [
                'stockItem' => $this->stockItem,
                'productName' => $this->productName,
                'daysRemaining' => $this->daysRemaining,
            ]);
    }
}
