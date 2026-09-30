<?php
/**
 * Every public front-end request lands here (it's the fallback template).
 * Send visitors to the same path on the Next.js site.
 */
wp_redirect(headless_frontend_url($_SERVER['REQUEST_URI'] ?? '/'), 302);
exit;
