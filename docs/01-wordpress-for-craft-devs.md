# WordPress for Craft developers

## The mental model in one paragraph

Almost everything in WordPress is a **post**: one row in `wp_posts` with a `post_type` column (`post`, `page`, `attachment`, `nav_menu_item`, `revision`, and your custom types). Extra data lives in **post meta** (`wp_postmeta`, key/value rows), and that's where ACF/SCF stores field values. Site-wide values live in **options** (`wp_options`, key/value). Code changes behavior by attaching callbacks to **hooks**. There's no Craft-style schema. Structure comes from plugins (ACF) registering fields that write meta.

## Craft → WordPress

| Craft | WordPress | In this repo |
|---|---|---|
| Section / Entry Type | **Post type** (`register_post_type`). `page` is built in and hierarchical | Built-in `page` |
| Entry | A post of that type | Home, About |
| Field layout | **ACF field group** + location rules ("show on post_type == page") | `group_page_builder` |
| **Matrix** field | **ACF Flexible Content** field. Each "block type" is a **Layout** | `blocks` field, 5 Layouts |
| Super Table / nested Matrix | **Repeater** (can nest inside a Layout) | Feature Grid `features` |
| Global Set | **ACF Options Page** (values stored in `wp_options`) | Site Settings |
| Navigation plugin / Structure | **Menus** (Appearance → Menus), assigned to a registered **menu location** | `primary` location |
| Assets / Volumes | **Media Library** (`attachment` posts, files in `wp-content/uploads`) | seeded placeholder images |
| Module / plugin | **Plugin**, or **mu-plugin** for project code | `mu-plugins/*.php` |
| Events (`Event::on`) | **Hooks**: actions (`add_action`) and filters (`add_filter`) | everywhere |
| Twig templates | **Theme** templates (PHP) | Unused. The theme only redirects |
| Project config (`config/project`) | Nothing built in. Field groups live in the DB by default. **Local JSON** or **PHP registration** is how you version them | PHP registration |
| GraphQL (built in) | **WPGraphQL** plugin + **WPGraphQL for ACF** | ✓ |
| Live Preview | Preview button + `preview_post_link` filter + a Next draft route | ✓ |
| `craft` CLI | **WP-CLI** (`wp …`, here `ddev wp …`) | `setup.sh` |

## Hooks: the single most important concept

- **Action**: "something happened, run my code." `add_action('acf/save_post', fn($id) => …, 20)`. The `20` is priority (lower runs first, default 10).
- **Filter**: "here's a value, return a modified one." `add_filter('preview_post_link', fn($link, $post) => $newLink, 10, 2)`. The last argument is how many parameters you accept.

Every customization here is a hook:

| File | Hook | Why |
|---|---|---|
| headless-config.php | `use_block_editor_for_post_type` (filter) | Turn off Gutenberg for Pages, so editors only see the Page Builder |
| headless-config.php | `after_setup_theme` → `register_nav_menus` | Create the `primary` menu location |
| page-builder-fields.php | `acf/init` → `acf_add_local_field_group` | Register fields in code |
| revalidate.php | `acf/save_post` (priority 20), `transition_post_status`, `wp_update_nav_menu` | Tell Next.js what changed |
| preview.php | `preview_post_link` (filter) | Point "Preview" at Next.js |

**Gotcha we hit:** `save_post_page` fires *before* ACF saves its fields. Hook `acf/save_post` at priority > 10 to run after the Page Builder values are written.

## Plugins, mu-plugins, themes

- **Plugins** (`wp-content/plugins`): installable, activatable in wp-admin. We use three: WPGraphQL, WPGraphQL for ACF, Secure Custom Fields. They're installed by `setup.sh`, not committed. In a real project you'd pin them with Composer + [WPackagist](https://wpackagist.org) or Bedrock.
- **mu-plugins** ("must use", `wp-content/mu-plugins`): single PHP files that always load, can't be deactivated, and load before plugins. Ideal for project code that the site can't live without. It's the closest thing to a Craft module.
- **Theme**: normally renders the site. Headless, it has no job, but WordPress requires one. Ours (`themes/headless/index.php`) redirects any public URL to the same path on Next.js.

## ACF vs SCF (a history question you may get)

ACF (Advanced Custom Fields) is owned by WP Engine. In Oct 2024, during the Automattic/WP Engine dispute, WordPress.org forked it as **Secure Custom Fields (SCF)**. SCF now ships the former ACF *Pro* features for free: Repeater, Flexible Content, Options Pages, Clone, Gallery. We checked that in this repo (SCF 6.9.5). The APIs (`acf_add_local_field_group`, `get_field`, `update_field`) and the `ACF` class are the same, so **WPGraphQL for ACF works unchanged**. Agencies mostly still run ACF Pro (paid, supported by WP Engine). Moving between the two is a drop-in change.

## Where content lives (useful when debugging)

```bash
ddev wp post list --post_type=page                 # Pages
ddev wp post meta list 5 | grep blocks             # Page Builder: blocks = ["hero","rich_text",…] + blocks_0_heading …
ddev wp option get options_footer_tagline          # Site Settings value
ddev wp eval 'print_r(get_field("blocks", 5));'    # what ACF hands PHP
```

ACF stores Flexible Content as the **list of Layout names** in `blocks`, plus one meta row per sub-field (`blocks_0_heading`, `blocks_2_features_1_title`, and so on). Every value also has a sibling `_blocks_0_heading` row pointing to its field key. That's why reordering is cheap for editors but the meta table gets big.

## Globals: where site-wide content goes

- **Navigation → Menus.** Editors already know them, links point to Pages by ID (so renaming a slug doesn't break the menu), and nesting is native. WPGraphQL returns a *flat* list with `parentId`. The Adapter builds the tree.
- **Everything else → an Options Page** (logo, footer columns, social links, copyright). One Options Page can have many field groups. Larger sites split it into several pages (Header, Footer, SEO defaults).

## Environment notes (ddev)

- `WP_ENVIRONMENT_TYPE=local` (in `.ddev/config.headless.yaml`) is needed because **Application Passwords only work over https unless the environment is `local`**.
- The WordPress container reaches Next.js on your Mac at `host.docker.internal:3000`.
- WPGraphQL blocks schema introspection for anonymous users by default. `setup.sh` turns it on for local tooling. Keep it off in production.
