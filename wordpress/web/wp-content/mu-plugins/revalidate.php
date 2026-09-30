<?php
/**
 * Plugin Name: Frontend Revalidation
 * Description: Tells Next.js which cache tags are stale when editors change content (on-demand ISR).
 *
 * Tag scheme (must match web/src/lib/cms/wordpress/tags.ts):
 *   page:{path}  one Page, e.g. page:/ or page:/about
 *   pages        anything listing Pages (static params)
 *   globals      Primary Menu + Site Settings
 */

function headless_revalidate(array $tags): void {
	$url = headless_env('HEADLESS_REVALIDATE_URL');
	if ($url === '') {
		return;
	}
	// Non-blocking: the editor's "Update" click shouldn't wait on the frontend.
	wp_remote_post($url, [
		'blocking' => false,
		'timeout'  => 1,
		'headers'  => [
			'Content-Type'        => 'application/json',
			'x-revalidate-secret' => headless_env('HEADLESS_REVALIDATE_SECRET'),
		],
		'body'     => wp_json_encode(['tags' => array_values(array_unique($tags))]),
	]);
}

/** WordPress URI ("/about/") → frontend path ("/about"). Front page is "/". */
function headless_page_path(WP_Post $post): string {
	if ((int) get_option('page_on_front') === $post->ID) {
		return '/';
	}
	return '/' . trim(get_page_uri($post), '/');
}

// acf/save_post runs AFTER ACF has written the Page Builder values (priority 10),
// unlike save_post_page, which fires before the fields are saved.
add_action('acf/save_post', function ($post_id) {
	if ($post_id === 'options') {
		headless_revalidate(['globals']);
		return;
	}
	if (!is_numeric($post_id) || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
		return;
	}
	$post = get_post($post_id);
	if ($post && $post->post_type === 'page') {
		headless_revalidate(['page:' . headless_page_path($post), 'pages']);
	}
}, 20);

// Unpublishing or trashing a Page must drop it from the frontend too.
add_action('transition_post_status', function ($new, $old, $post) {
	if ($post->post_type === 'page' && $old === 'publish' && $new !== 'publish') {
		headless_revalidate(['page:' . headless_page_path($post), 'pages']);
	}
}, 10, 3);

// Menu changes, and changing which Page is the front page, affect Globals / routing.
add_action('wp_update_nav_menu', fn() => headless_revalidate(['globals']));
add_action('update_option_page_on_front', fn() => headless_revalidate(['pages', 'page:/', 'globals']));
