@component('mail::message')
# Verify your email address

Hi {{ $name }},

Thanks for signing up for **FurLog**! Before you get started, we need to confirm your email address.

Click the button below to verify your email. This link will expire in **60 minutes**.

@component('mail::button', ['url' => $url])
Verify Email Address
@endcomponent

If you did not create a FurLog account, you can safely ignore this email — no action is required.

@component('mail::subcopy')
If you're having trouble clicking the button, copy and paste the URL below into your web browser:
<span class="break-all">[{{ $url }}]({{ $url }})</span>
@endcomponent
@endcomponent
