/**
 * Web3Forms payload for contact forms — locked shape (see contactSheetContract).
 * Never add `name` to DOM or payload.
 */
export const CONTACT_FORM_PAYLOAD_KEYS = ['access_key', 'email', 'message', 'subject'] as const;

export const CONTACT_FORM_OPTIONAL_PAYLOAD_KEYS = ['project_stage'] as const;

export function buildContactFormPayload(fd: FormData, accessKey: string): Record<string, string> {
  const payload: Record<string, string> = {
    access_key: accessKey,
    email: String(fd.get('email') ?? '').trim(),
    message: String(fd.get('message') ?? '').trim(),
    subject: 'Contact form — byklika.com'
  };

  const projectStage = String(fd.get('project_stage') ?? '').trim();
  if (projectStage) {
    payload.project_stage = projectStage;
  }

  return payload;
}
