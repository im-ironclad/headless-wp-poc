<?php
/**
 * Demo content. Run via `ddev wp eval-file seed.php` (setup.sh does this).
 * Idempotent: re-running updates the same Pages, images, menu and settings.
 *
 * Writing Page Builder data in code: update_field() with the Flexible Content field
 * takes an array of rows, and each row names its Layout in `acf_fc_layout`.
 */

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

/** Import a placeholder image once; reuse it on later runs. */
function seed_image(string $key, int $w = 1600, int $h = 900): int {
	$existing = get_posts(['post_type' => 'attachment', 'meta_key' => '_seed_key', 'meta_value' => $key, 'fields' => 'ids', 'numberposts' => 1]);
	if ($existing) {
		return $existing[0];
	}
	$id = media_sideload_image("https://picsum.photos/seed/{$key}/{$w}/{$h}.jpg", 0, null, 'id');
	if (is_wp_error($id)) {
		WP_CLI::error("Image {$key}: " . $id->get_error_message());
	}
	update_post_meta($id, '_seed_key', $key);
	update_post_meta($id, '_wp_attachment_image_alt', ucwords(str_replace('-', ' ', $key)) . ' placeholder');
	return $id;
}

/** Create or update a published Page by slug. */
function seed_page(string $slug, string $title, string $excerpt, int $menu_order): int {
	$page = get_page_by_path($slug, OBJECT, 'page');
	$id = wp_insert_post([
		'ID'           => $page->ID ?? 0,
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_excerpt' => $excerpt,
		'menu_order'   => $menu_order,
	], true);
	if (is_wp_error($id)) {
		WP_CLI::error($id->get_error_message());
	}
	return $id;
}

$link = fn(string $title, string $url, string $target = '') => ['title' => $title, 'url' => $url, 'target' => $target];

// Remove WordPress's sample content so it doesn't show up on the frontend.
if ($sample = get_page_by_path('sample-page', OBJECT, 'page')) {
	wp_delete_post($sample->ID, true);
}

$home  = seed_page('home', 'Home', 'A headless WordPress Page Builder demo.', 0);
$about = seed_page('about', 'About', 'About this proof of concept.', 1);

update_field('field_pb_blocks', [
	[
		'acf_fc_layout' => 'hero',
		'heading'       => 'Build pages from blocks',
		'subheading'    => 'Editors add, remove and reorder sections in WordPress. Next.js renders them.',
		'image'         => seed_image('hero'),
		'cta'           => $link('Learn more', home_url('/about/')),
	],
	[
		'acf_fc_layout' => 'rich_text',
		'content'       => '<h2>What is this?</h2><p>A proof of concept for a <strong>headless WordPress</strong> Page Builder using Flexible Content, WPGraphQL and Next.js.</p><ul><li>Structured content</li><li>Typed GraphQL</li><li>On-demand revalidation</li></ul>',
	],
	[
		'acf_fc_layout' => 'feature_grid',
		'heading'       => 'Why a Page Builder?',
		'features'      => [
			['title' => 'Flexible', 'text' => 'Any Block, any order, on any Page.', 'image' => seed_image('flexible', 600, 400)],
			['title' => 'Structured', 'text' => 'Every Block has typed fields, not free-form HTML.', 'image' => seed_image('structured', 600, 400)],
			['title' => 'Fast', 'text' => 'Static pages, refreshed the moment an editor clicks Update.', 'image' => seed_image('fast', 600, 400)],
		],
	],
	[
		'acf_fc_layout'  => 'media_text',
		'image'          => seed_image('media-text', 1200, 900),
		'content'        => '<h3>Media + Text</h3><p>Editors choose which side the image sits on.</p>',
		'image_position' => 'right',
	],
	[
		'acf_fc_layout' => 'cta_banner',
		'heading'       => 'Ready to try it?',
		'text'          => 'Reorder these Blocks in wp-admin and click Update.',
		'cta'           => $link('Open wp-admin', admin_url('post.php?post=' . $home . '&action=edit'), '_blank'),
	],
], $home);

update_field('field_pb_blocks', [
	[
		'acf_fc_layout'  => 'media_text',
		'image'          => seed_image('about', 1200, 900),
		'content'        => '<h2>About</h2><p>This Page uses a different set of Blocks in a different order: same Page Builder, different content.</p>',
		'image_position' => 'left',
	],
	[
		'acf_fc_layout' => 'cta_banner',
		'heading'       => 'Back to the start',
		'text'          => 'See every Block Type on the home page.',
		'cta'           => $link('Home', home_url('/')),
	],
], $about);

// Reading settings: use a static Page as the front page (Settings → Reading).
update_option('show_on_front', 'page');
update_option('page_on_front', $home);

// Primary Menu, assigned to the `primary` location registered in headless-config.php.
$menu = wp_get_nav_menu_object('Primary') ?: get_term(wp_create_nav_menu('Primary'), 'nav_menu');
foreach (wp_get_nav_menu_items($menu->term_id) ?: [] as $item) {
	wp_delete_post($item->ID, true);
}
foreach ([$home, $about] as $position => $page_id) {
	wp_update_nav_menu_item($menu->term_id, 0, [
		'menu-item-object-id' => $page_id,
		'menu-item-object'    => 'page',
		'menu-item-type'      => 'post_type',
		'menu-item-status'    => 'publish',
		'menu-item-position'  => $position + 1,
	]);
}
set_theme_mod('nav_menu_locations', array_merge(get_theme_mod('nav_menu_locations', []) ?: [], ['primary' => $menu->term_id]));

// Site Settings (Options Page). 'option' is ACF's post_id for options pages.
update_field('field_ss_logo', seed_image('logo', 200, 200), 'option');
update_field('field_ss_tagline', 'Content by WordPress, rendered by Next.js.', 'option');
update_field('field_ss_footer_columns', [
	['heading' => 'Site', 'links' => [['link' => $link('Home', home_url('/'))], ['link' => $link('About', home_url('/about/'))]]],
	['heading' => 'Resources', 'links' => [
		['link' => $link('WPGraphQL', 'https://www.wpgraphql.com', '_blank')],
		['link' => $link('Next.js', 'https://nextjs.org', '_blank')],
	]],
], 'option');
update_field('field_ss_social', [
	['platform' => 'instagram', 'url' => 'https://instagram.com/'],
	['platform' => 'linkedin', 'url' => 'https://linkedin.com/'],
], 'option');
update_field('field_ss_copyright', '© {year} Headless WP POC', 'option');

WP_CLI::success("Seeded Home (#{$home}), About (#{$about}), Primary Menu and Site Settings.");
