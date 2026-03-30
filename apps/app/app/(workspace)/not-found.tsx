import { NotFoundContent } from "../not-found-content";

/**
 * 404 when `notFound()` runs under the workspace layout — header + sidebar already
 * come from parent layouts, so only the message body is rendered here.
 */
export default function WorkspaceNotFound() {
  return <NotFoundContent />;
}
