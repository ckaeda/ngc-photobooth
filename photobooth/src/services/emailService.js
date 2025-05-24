export async function sendEmail(email, images) {
  const response = await fetch(`https://ngc-photobooth-production.up.railway.app/api/send-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, images }), // array of { key, image }
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response.json();
}
