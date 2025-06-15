import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method == 'GET') {
    return res.status(200).json({ message: "Hello!" })
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, filename } = req.body;

  if (!base64 || !filename) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const base64Data = image.split(',')[1]; // remove the "data:image/png;base64," prefix
    const binary = atob(base64Data); // decode base64
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    const file = new Blob([array], { type: 'image/png' });

    const filename = `${Date.now()}.png`;
    const result = await put(filename, file, { access: 'public' });

    return res.status(200).json({ url: result.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
