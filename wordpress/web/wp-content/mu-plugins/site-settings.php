<?php
/**
 * Plugin Name: Site Settings
 * Description: An Options Page for editor-managed Globals (logo, footer, social links).
 *
 * Craft equivalent: a Global Set. The header navigation is NOT here: it uses native
 * WordPress Menus (Appearance → Menus), which editors already know and which link to Pages by ID.
 */

add_action('acf/init', function () {
	if (!function_exists('acf_add_options_page')) {
		return;
	}

	acf_add_options_page([
		'page_title'         => 'Site Settings',
		'menu_title'         => 'Site Settings',
		'menu_slug'          => 'site-settings',
		'capability'         => 'edit_theme_options',
		'icon_url'           => 'dashicons-admin-site-alt3',
		'position'           => 60,
		'redirect'           => false,
		// WPGraphQL for ACF: exposed as the root query field `siteSettings`.
		'show_in_graphql'    => true,
		'graphql_type_name'  => 'SiteSettings',
	]);

	acf_add_local_field_group([
		'key'    => 'group_site_settings',
		'title'  => 'Site Settings',
		'fields' => [
			['key' => 'field_ss_logo', 'name' => 'logo', 'label' => 'Logo', 'type' => 'image', 'return_format' => 'array'],
			['key' => 'field_ss_tagline', 'name' => 'footer_tagline', 'label' => 'Footer tagline', 'type' => 'text'],
			[
				'key'          => 'field_ss_footer_columns',
				'name'         => 'footer_columns',
				'label'        => 'Footer columns',
				'type'         => 'repeater',
				'layout'       => 'block',
				'max'          => 4,
				'button_label' => 'Add Column',
				'sub_fields'   => [
					['key' => 'field_ss_col_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
					[
						'key'          => 'field_ss_col_links',
						'name'         => 'links',
						'label'        => 'Links',
						'type'         => 'repeater',
						'layout'       => 'table',
						'button_label' => 'Add Link',
						'sub_fields'   => [
							['key' => 'field_ss_col_link', 'name' => 'link', 'label' => 'Link', 'type' => 'link'],
						],
					],
				],
			],
			[
				'key'          => 'field_ss_social',
				'name'         => 'social_links',
				'label'        => 'Social links',
				'type'         => 'repeater',
				'layout'       => 'table',
				'button_label' => 'Add Social Link',
				'sub_fields'   => [
					[
						'key'     => 'field_ss_social_platform',
						'name'    => 'platform',
						'label'   => 'Platform',
						'type'    => 'select',
						'choices' => ['instagram' => 'Instagram', 'facebook' => 'Facebook', 'x' => 'X', 'linkedin' => 'LinkedIn', 'youtube' => 'YouTube'],
					],
					['key' => 'field_ss_social_url', 'name' => 'url', 'label' => 'URL', 'type' => 'url'],
				],
			],
			['key' => 'field_ss_copyright', 'name' => 'copyright', 'label' => 'Copyright', 'type' => 'text', 'instructions' => 'Use {year} for the current year.'],
		],
		'location' => [
			[['param' => 'options_page', 'operator' => '==', 'value' => 'site-settings']],
		],
		'show_in_graphql'    => 1,
		'graphql_field_name' => 'siteSettingsFields',
	]);
});
