<?php
/**
 * Plugin Name: Headless Config
 * Description: Core settings for running WordPress purely as a content API behind a Next.js frontend.
 *
 * mu-plugins ("must-use") load automatically, can't be deactivated from wp-admin,
 * and load before normal plugins, which is ideal for project-level code (like a Craft module).
 */

/** Where the public site lives. Set in .ddev/config.headless.yaml. */
function headless_env(string $name, string $default = ''): string {
	$value = getenv($name);
	return $value === false || $value === '' ? $default : $value;
}

function headless_frontend_url(string $path = ''): string {
	return rtrim(headless_env('HEADLESS_FRONTEND_URL', 'http://localhost:3000'), '/') . $path;
}

// Pages use the Page Builder instead of Gutenberg. Posts keep Gutenberg (unused in this POC).
add_filter('use_block_editor_for_post_type', function (bool $use, string $post_type) {
	return $post_type === 'page' ? false : $use;
}, 10, 2);

// Register a menu location. Editors assign a menu to it in Appearance → Menus,
// and the frontend queries it by location (PRIMARY) instead of a menu name.
add_action('after_setup_theme', function () {
	register_nav_menus(['primary' => 'Primary Menu']);
});

// Excerpts on pages are used as the SEO meta description on the frontend.
add_action('init', function () {
	add_post_type_support('page', 'excerpt');
});

// Field groups are Local JSON (themes/headless/acf-json), edited on a local site and committed.
// Hide the SCF admin everywhere else, so nobody changes the schema on staging/production
// where the edit would be lost on the next deploy (Craft: allowAdminChanges = false).
add_filter('acf/settings/show_admin', fn() => wp_get_environment_type() === 'local');
