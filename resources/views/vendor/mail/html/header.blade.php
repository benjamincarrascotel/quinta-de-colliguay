@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<div class="logo-container">
<img src="{{ asset('logo.png') }}" class="logo" alt="{{ config('app.name') }} Logo">
</div>
</a>
</td>
</tr>
