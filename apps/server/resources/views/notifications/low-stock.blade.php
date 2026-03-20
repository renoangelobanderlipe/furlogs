@component('mail::message')
# Food Stock Running Low

Hi there,

Your food stock for **{{ $productName }}** is running low.

**Days Remaining:** {{ $daysRemaining }} day(s)

We recommend restocking soon to ensure your pet never runs out of food.

@component('mail::button', ['url' => config('app.frontend_url', config('app.url'))])
View Stock in FurLog
@endcomponent

Thanks,
The FurLog Team
@endcomponent
