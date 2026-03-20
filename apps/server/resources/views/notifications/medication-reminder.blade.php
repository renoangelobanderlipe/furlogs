@component('mail::message')
# Medication Reminder

Hi there,

This is a reminder about **{{ $petName }}'s** upcoming medication schedule.

**Medication:** {{ $reminder->title }}
**Due Date:** {{ $reminder->due_date->format('F j, Y') }}

Please ensure the medication is administered as prescribed.

@component('mail::button', ['url' => config('app.frontend_url', config('app.url'))])
View in FurLog
@endcomponent

Thanks for taking care of your pet,
The FurLog Team
@endcomponent
