# Headless WordPress Page Builder

A POC where content editors compose Pages from reorderable sections in WordPress, and a CMS-agnostic Next.js frontend renders them.

## Content

**Page**:
A routable piece of content with a slug and an ordered list of Blocks.
_Avoid_: Entry, post, landing page

**Page Builder**:
The single field on a Page where editors add, reorder and remove Blocks.
_Avoid_: Matrix, flexible content (outside WordPress-specific discussion)

**Block**:
One instance of a section on a Page, e.g. *the* hero on Home.
_Avoid_: Component, section, module

**Block Type**:
The kind of a Block: Hero, Rich Text, Feature Grid, Media + Text, or CTA Banner.
_Avoid_: Layout (except when naming the ACF concept), block kind

**Unsupported Block**:
A Block the frontend can't render, because its Block Type is unknown to the frontend or it's missing required content. Hidden from visitors and flagged to editors and developers.
_Avoid_: Broken block, unknown block

**Layout**:
ACF's name for a Block Type inside a Flexible Content field. Used only when talking about the WordPress side.

**Gutenberg block**:
WordPress's native editor block. It's a separate system that this project does *not* use, and it's unrelated to Block.

## Site-wide

**Globals**:
Site-wide content that doesn't belong to any Page: the header navigation and the Site Settings.
_Avoid_: Settings, options, config

**Site Settings**:
The editor-managed Globals for brand and footer: logo, tagline, footer columns, social links, copyright.
_Avoid_: Options page (except when naming the ACF concept)

**Primary Menu**:
The editor-managed header navigation.
_Avoid_: Nav, navbar

## Frontend

**Block Component**:
The frontend component that renders one Block Type.

**Adapter**:
The code that converts one CMS's responses into Pages, Blocks and Globals.
_Avoid_: Mapper, transformer, normalizer

**Draft Preview**:
Viewing an unpublished or edited Page on the frontend before it is published.
_Avoid_: Draft mode (that's the Next.js mechanism), preview mode
