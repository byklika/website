export type Web3FormsSubmitResult = {
  ok: boolean;
  message: string;
};

/** POST JSON payload to Web3Forms (same contract as contact form). */
export async function submitToWeb3Forms(
  payload: Record<string, string>
): Promise<Web3FormsSubmitResult> {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = (await res.json()) as {
    success?: boolean;
    message?: string;
    body?: { message?: string };
  };

  const ok = data.success === true;
  const message =
    data.message ||
    data.body?.message ||
    (ok ? 'Mensaje enviado.' : 'No pudimos enviar tu mensaje.');

  return { ok, message };
}
