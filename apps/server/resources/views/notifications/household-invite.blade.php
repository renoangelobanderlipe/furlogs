@component('mail::message')
# You're Invited to Join FurLog

Hi there,

**{{ $inviterName }}** has invited you to join their household **{{ $householdName }}** on FurLog — the pet care management app.

Join the household to collaborate on tracking your pets' health, vaccinations, medications, and more.

@component('mail::button', ['url' => $inviteUrl])
Accept Invitation
@endcomponent

If you were not expecting this invitation, you can safely ignore this email.

Thanks,
The FurLog Team
@endcomponent
