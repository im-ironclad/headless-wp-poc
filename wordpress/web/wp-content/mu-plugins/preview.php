<?php
/**
 * Plugin Name: Frontend Preview
 * Description: Points wp-admin's "Preview" button at the Next.js Draft Preview route.
 *
 * Flow: Preview → Next /api/preview?id=…&secret=… → Next enables draftMode and redirects to
 * /preview/{id} → Next fetches the Page with `asPreview: true`, authenticated with an
 * Application Password, so drafts and unsaved-autosave changes are visible.
 */

add_filter('preview_post_link', function (string $link, WP_Post $post) {
	if ($post->post_type !== 'page') {
		return $link;
	}
	return add_query_arg([
		'id'     => $post->ID,
		'secret' => rawurlencode(headless_env('HEADLESS_PREVIEW_SECRET')),
	], headless_frontend_url('/api/preview'));
}, 10, 2);
