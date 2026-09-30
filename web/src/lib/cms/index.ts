/**
 * The app's single entry point for content. Today it's backed by WordPress; adding
 * another CMS means another Adapter behind these same functions and types.
 */
export { getAllPagePaths, getGlobals, getPage, getPreviewPage } from "./wordpress";
export type * from "./types";
