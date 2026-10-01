<?php
/**
 * Imports the theme's acf-json/*.json files into the database: the CLI version of the
 * "Sync available" button in SCF → Field Groups / Options Pages.
 *
 * Usage: ddev wp eval-file sync-acf-json.php   (run by setup.sh; safe to re-run)
 *
 * The JSON files are the source of truth (version-controlled). SCF already reads them on
 * every request, so fields work without this; syncing makes them editable in wp-admin.
 * A file is imported when it's missing from the database or newer than the database copy.
 */

// Same as SCF's own sync: don't rewrite the .json file while importing it.
acf_update_setting('json', false);

foreach (['acf-ui-options-page', 'acf-field-group'] as $post_type) {
	foreach (acf_get_local_json_files($post_type) as $key => $file) {
		$local    = json_decode(file_get_contents($file), true);
		$existing = acf_get_internal_post_type_post($key, $post_type);

		if ($existing && get_post_modified_time('U', true, $existing) >= ($local['modified'] ?? 0)) {
			WP_CLI::log("Up to date: {$local['title']}");
			continue;
		}

		$local['ID'] = $existing->ID ?? 0;
		acf_import_internal_post_type($local, $post_type);
		WP_CLI::success("Synced: {$local['title']}");
	}
}
