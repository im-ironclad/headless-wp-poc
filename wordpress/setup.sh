#!/usr/bin/env bash
# One-command, idempotent setup of the headless WordPress backend.
# Usage: ./wordpress/setup.sh   (safe to re-run)
set -euo pipefail
cd "$(dirname "$0")"

ddev start

if ! ddev wp core is-installed 2>/dev/null; then
  ddev wp core download --skip-content --force
  ddev wp core install --url=https://headless-wp.ddev.site --title="Headless WP" \
    --admin_user=admin --admin_password=admin --admin_email=admin@example.com --skip-email
fi

# WPGraphQL = the GraphQL API; WPGraphQL for ACF = exposes ACF/SCF fields in it;
# Secure Custom Fields = free fork of ACF (includes Flexible Content, Repeater, Options Pages).
ddev wp plugin install wp-graphql wpgraphql-acf secure-custom-fields --activate
ddev wp plugin delete akismet hello 2>/dev/null || true
ddev wp theme activate headless
ddev wp rewrite structure '/%postname%/' --hard

# Allow schema introspection for local tooling (GraphiQL, codegen). Keep this off in production.
ddev wp option update graphql_general_settings '{"public_introspection_enabled":"on","debug_mode_enabled":"on"}' --format=json

# Dedicated editor account used by Next.js to read drafts (Draft Preview).
ddev wp user get headless-preview >/dev/null 2>&1 || \
  ddev wp user create headless-preview preview@example.com --role=editor --user_pass="$(openssl rand -hex 16)"
ddev wp user application-password delete headless-preview --all >/dev/null 2>&1 || true
APP_PASSWORD="$(ddev wp user application-password create headless-preview nextjs-preview --porcelain | tr -d '\r')"

ddev wp eval-file seed.php

cat <<ENV

✅ WordPress ready: https://headless-wp.ddev.site/wp-admin  (admin / admin)

Put this in web/.env.local:

WORDPRESS_URL=http://headless-wp.ddev.site
WORDPRESS_PREVIEW_USER=headless-preview
WORDPRESS_PREVIEW_APP_PASSWORD=${APP_PASSWORD}
REVALIDATE_SECRET=dev-revalidate-secret
PREVIEW_SECRET=dev-preview-secret
ENV
