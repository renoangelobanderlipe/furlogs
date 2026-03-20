@component('mail::message')
# Vet Follow-Up Reminder

Hi there,

**{{ $petName }}** has an upcoming vet follow-up appointment approaching.

**Reminder:** {{ $reminder->title }}
**Due Date:** {{ $reminder->due_date->format('F j, Y') }}

@if($reminder->description)
**Notes:** {{ $reminder->description }}
@endif

Please schedule the follow-up appointment with your vet.

@component('mail::button', ['url' => config('app.frontend_url', config('app.url'))])
View in FurLog
@endcomponent

Thanks for keeping your pet healthy,
The FurLog Team
@endcomponent
