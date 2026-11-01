export function buildWhatsAppLink(raw: string | null | undefined): string {
  if (!raw) return '';
  let digits = String(raw).replace(/[^\d]/g, '');
  if (digits.length === 10) digits = '91' + digits;
  return digits ? `https://wa.me/${digits}` : '';
}

export function resolveWhatsAppNumber(
  whatsApp: string | null | undefined,
  mobile: string | null | undefined,
): string {
  return (whatsApp || mobile || '').trim();
}

export function openPhoneCall(mobile: string | null | undefined): void {
  const number = (mobile || '').trim();
  if (number) window.location.href = `tel:${number}`;
}

export function openWhatsAppChat(number: string | null | undefined): void {
  const link = buildWhatsAppLink(number);
  if (link) window.open(link, '_blank', 'noopener');
}
