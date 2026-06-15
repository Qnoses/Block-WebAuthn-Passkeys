# Block WebAuthn Passkeys

A userscript that blocks WebAuthn / passkey ceremonies on every site, so you're
never prompted to create or use a passkey — while ordinary password and
federated logins keep working.

## What it does

Sites increasingly push **passkeys** (WebAuthn), invoked through the Credential
Management API:

- `navigator.credentials.create({ publicKey })` — *enroll* a new passkey
- `navigator.credentials.get({ publicKey })` — *sign in* with a passkey

This script wraps both calls. Any request carrying a `publicKey` option is
rejected with a `NotAllowedError` — the same error the browser raises when you
dismiss the passkey dialog — so the site behaves as if you cancelled and
typically falls back to its password flow. Calls **without** `publicKey`
(password credentials, federated / identity credentials) pass straight through
untouched.

It also makes passkey feature-detection report "no authenticator available," so
sites that check *before* prompting won't surface passkey UI at all. (That part
is optional — see the comment in the script.)

## Why

- Stop the relentless "set up a passkey?" nags.
- Avoid accidentally enrolling a passkey you didn't mean to.
- Keep using your password manager everywhere, on your terms.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) or
   [Violentmonkey](https://violentmonkey.github.io/).
2. Open the raw script — your manager will offer to install it:
   **https://raw.githubusercontent.com/Qnoses/Block-WebAuthn-Passkeys/main/block-webauthn-passkeys.user.js**
3. Updates are wired through the script's `@updateURL` (the raw file on `main`),
   so pushing a new version updates everyone who has it installed.

## Scope

Runs on **all sites**, in **all frames**, at `document-start` — before page
scripts run, so the patch is in place before any passkey call. It runs in the
page context (`@grant none`).

## Important: this also blocks passkey *sign-ins*

By design this is blunt — it blocks **all** WebAuthn, not just enrollment. If you
actually use a passkey to log into a site, this will break that login. To keep
passkeys on specific sites, add an `@exclude` line per site to the metadata
block, e.g.:

```js
// @exclude      *://*.github.com/*
// @exclude      *://account.example.com/*
```

Also note: sites that **require** passkeys with no password fallback will become
unusable on those flows while this is active, and the script rejects rather than
silently no-opping (the site sees a real `NotAllowedError`).

## Compatibility note (anti-bot / integrity systems)

Because it patches a standard browser API (`CredentialsContainer.prototype`) on
every site, the patched methods are no longer "native." A few aggressive
bot-detection / integrity systems fingerprint native-function integrity and
*may* weigh this. If a site's gated actions start misbehaving, `@exclude` that
site to rule the script out.

## License

MIT — see [LICENSE.md](LICENSE.md).
