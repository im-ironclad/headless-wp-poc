<?php
/**
 * Plugin Name: Page Builder Fields
 * Description: Registers the Page Builder (a Flexible Content field) on Pages. Defined in code so it's version-controlled.
 *
 * Craft equivalent: a Matrix field on a Section's Entry Type.
 * Each "layout" below is a Block Type (Hero, Rich Text, ...).
 */

add_action('acf/init', function () {
	if (!function_exists('acf_add_local_field_group')) {
		return;
	}

	// Small helpers to keep the field definitions readable.
	// Every ACF field needs a globally unique `key`; `name` is what's stored in post meta.
	$text = fn(string $key, string $name, string $label, array $extra = []) =>
		array_merge(['key' => $key, 'name' => $name, 'label' => $label, 'type' => 'text'], $extra);
	$field = fn(string $type, string $key, string $name, string $label, array $extra = []) =>
		array_merge(['key' => $key, 'name' => $name, 'label' => $label, 'type' => $type], $extra);

	acf_add_local_field_group([
		'key'    => 'group_page_builder',
		'title'  => 'Page Builder',
		'fields' => [
			[
				'key'          => 'field_pb_blocks',
				'name'         => 'blocks',
				'label'        => 'Blocks',
				'type'         => 'flexible_content',
				'button_label' => 'Add Block',
				'layouts'      => [
					'layout_hero' => [
						'key'        => 'layout_hero',
						'name'       => 'hero',
						'label'      => 'Hero',
						'display'    => 'block',
						'sub_fields' => [
							$text('field_hero_heading', 'heading', 'Heading', ['required' => 1]),
							$field('textarea', 'field_hero_subheading', 'subheading', 'Subheading', ['rows' => 2]),
							$field('image', 'field_hero_image', 'image', 'Image', ['return_format' => 'array']),
							$field('link', 'field_hero_cta', 'cta', 'Call to action'),
						],
					],
					'layout_rich_text' => [
						'key'        => 'layout_rich_text',
						'name'       => 'rich_text',
						'label'      => 'Rich Text',
						'display'    => 'block',
						'sub_fields' => [
							$field('wysiwyg', 'field_rich_text_content', 'content', 'Content', ['media_upload' => 0]),
						],
					],
					'layout_feature_grid' => [
						'key'        => 'layout_feature_grid',
						'name'       => 'feature_grid',
						'label'      => 'Feature Grid',
						'display'    => 'block',
						'sub_fields' => [
							$text('field_feature_grid_heading', 'heading', 'Heading'),
							$field('repeater', 'field_feature_grid_features', 'features', 'Features', [
								'layout'       => 'block',
								'button_label' => 'Add Feature',
								'sub_fields'   => [
									$text('field_feature_title', 'title', 'Title', ['required' => 1]),
									$field('textarea', 'field_feature_text', 'text', 'Text', ['rows' => 3]),
									$field('image', 'field_feature_image', 'image', 'Image', ['return_format' => 'array']),
								],
							]),
						],
					],
					'layout_media_text' => [
						'key'        => 'layout_media_text',
						'name'       => 'media_text',
						'label'      => 'Media + Text',
						'display'    => 'block',
						'sub_fields' => [
							$field('image', 'field_media_text_image', 'image', 'Image', ['return_format' => 'array', 'required' => 1]),
							$field('wysiwyg', 'field_media_text_content', 'content', 'Content', ['media_upload' => 0]),
							$field('select', 'field_media_text_image_position', 'image_position', 'Image position', [
								'choices'       => ['left' => 'Left', 'right' => 'Right'],
								'default_value' => 'left',
							]),
						],
					],
					'layout_cta_banner' => [
						'key'        => 'layout_cta_banner',
						'name'       => 'cta_banner',
						'label'      => 'CTA Banner',
						'display'    => 'block',
						'sub_fields' => [
							$text('field_cta_banner_heading', 'heading', 'Heading', ['required' => 1]),
							$field('textarea', 'field_cta_banner_text', 'text', 'Text', ['rows' => 2]),
							$field('link', 'field_cta_banner_cta', 'cta', 'Call to action'),
						],
					],
				],
			],
		],
		// Attach to all Pages (Craft: "which Entry Types get this field layout").
		'location' => [
			[['param' => 'post_type', 'operator' => '==', 'value' => 'page']],
		],
		'hide_on_screen' => ['the_content'],

		// WPGraphQL for ACF: expose this group as `page.pageBuilder`.
		'show_in_graphql'    => 1,
		'graphql_field_name' => 'pageBuilder',
		'map_graphql_types_from_location_rules' => 1,
	]);
});
