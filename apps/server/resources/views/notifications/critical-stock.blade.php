@component('mail::message')
# URGENT: Food Stock Critically Low

Hi there,

Your food stock for **{{ $productName }}** is critically low and needs immediate attention.

**Days Remaining:** {{ $daysRemaining }} day(s)
@if($runsOutDate)
**Runs Out:** {{ $runsOutDate }}
@endif

Please restock immediately to avoid running out of food for your pet.

@component('mail::button', ['url' => config('app.frontend_url', config('app.url')), 'color' => 'red'])
Restock Now in FurLog
@endcomponent

Thanks,
The FurLog Team
@endcomponent
