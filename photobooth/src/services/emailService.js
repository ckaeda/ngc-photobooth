export async function sendEmail(email, imageBase64) {
  const response = await fetch('http://localhost:5000/api/send-photo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, image: imageBase64 }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response.json();
}
