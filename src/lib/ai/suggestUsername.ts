import model from './geminiClient.ts';

async function getUsernameSuggestions(fullName: string): Promise<string[]> {
  const prompt = `
  Generate 10 creative and unique username suggestions for the person named "${fullName}".
  Avoid using offensive words. Return only the usernames as a clean bullet list.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text
    .split('\n')
    .map(line => line.replace(/^[-*\d.]\s*/, '').trim())
    .filter(line => line.length && !line.includes(' '));
}

export default getUsernameSuggestions;
