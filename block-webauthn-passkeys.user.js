// ==UserScript==
// @name         Block WebAuthn / Passkeys
// @namespace    https://github.com/Qnoses
// @version      1.0.0
// @description  Blocks WebAuthn / passkey prompts (navigator.credentials.get & .create with a publicKey option) on every site, while leaving password and federated credentials untouched. Optionally hides passkey UI by making feature-detection report no authenticator.
// @author       Qnoses
// @license      MIT
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://github.com/Qnoses/Block-WebAuthn-Passkeys
// @supportURL   https://github.com/Qnoses/Block-WebAuthn-Passkeys/issues
// @downloadURL  https://raw.githubusercontent.com/Qnoses/Block-WebAuthn-Passkeys/main/block-webauthn-passkeys.user.js
// @updateURL    https://raw.githubusercontent.com/Qnoses/Block-WebAuthn-Passkeys/main/block-webauthn-passkeys.user.js
// ==/UserScript==
(function () {
  'use strict';
  const proto = window.CredentialsContainer && window.CredentialsContainer.prototype;
  if (!proto || proto.__passkey_blocked__) return;
  proto.__passkey_blocked__ = true;
  const reject = () => Promise.reject(
    new DOMException('WebAuthn blocked by userscript', 'NotAllowedError')
  );
  const ogGet = proto.get;
  const ogCreate = proto.create;
  if (typeof ogGet === 'function') {
    Object.defineProperty(proto, 'get', {
      configurable: true, writable: true,
      value: function (options) {
        if (options && options.publicKey) return reject();
        return ogGet.call(this, options);
      },
    });
  }
  if (typeof ogCreate === 'function') {
    Object.defineProperty(proto, 'create', {
      configurable: true, writable: true,
      value: function (options) {
        if (options && options.publicKey) return reject();
        return ogCreate.call(this, options);
      },
    });
  }
  // Optional: also make passkey feature-detection report "unavailable", so sites
  // that check before prompting won't surface passkey UI at all. Remove this block
  // if you'd rather sites still *offer* passkeys (the get/create calls above will
  // still block them if a user goes ahead).
  if (window.PublicKeyCredential) {
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable =
      () => Promise.resolve(false);
    window.PublicKeyCredential.isConditionalMediationAvailable =
      () => Promise.resolve(false);
  }
})();
