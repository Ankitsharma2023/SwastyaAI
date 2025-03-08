import { GEMINI_API } from '$env/static/private';
import OpenAI from 'openai';
export async function POST({ request }) {
	const { data, prompt } = await request.json();
	const openai = new OpenAI({
		apiKey: GEMINI_API,
		baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
	});
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a helpful assistant that returns valid json data with a  only single  string field 'edited_text' after making asked changes in the this data: ${data}`
				},
				{ role: 'user', content: prompt }
			],
			max_tokens: 2048,
			n: 1,
			temperature: 0.2
		});

		let report = response.choices[0].message.content.trim();
		const pattern = /(```json)([\s\S]*?)(```)/;
		const match = report.match(pattern);
		if (match) {
			report = match[2];
		}

		return new Response(JSON.stringify({ report }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Error editing transcript' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
