@component('mail::message')
# Upcoming Vaccination Reminder

Hi there,

This is a reminder that **{{ $petName }}** has an upcoming vaccination due.

**Vaccination:** {{ $reminder->title }}
**Due Date:** {{ $reminder->due_date->format('F j, Y') }}

Please make sure to schedule an appointment with your vet before the due date.

@component('mail::button', ['url' => config('app.frontend_url', config('app.url'))])
View in FurLog
@endcomponent

Thanks for keeping your pet healthy,
The FurLog Team
@endcomponent
