import { GEMINI_API } from '$env/static/private';
import OpenAI from 'openai';

export async function POST({ request }) {
	const { values } = await request.json();
	const tmpl =
		'{"Name":"","Age":"","Gender":"","History of Present Illness":"","Social History":"","Family History":"","Allergies":"","Medications":"","Immunizations":"","Review of Systems":"","Physical Exam":"","Results":"","Procedure":"","Assessment and Plan":""}';

	const openai = new OpenAI({
		apiKey: GEMINI_API,
		base_url: 'https://generativelanguage.googleapis.com/v1beta/openai/'
	});
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant  that returns valid json data with a field like name of necessary information from given conversation between doctor and patient if conversation is not related to medical you return null.Do not assume anything.'
				},
				{
					role: 'user',
					content: `Please extract relevant clinical information from the following patient encounter and organize it in the provided JSON format ${tmpl}. For any fields where no information is available, leave the field as an empty string (''). Encounter:  ${values}`
				}
			],
			temperature: 0.2,
			top_p: 0.7,
			max_tokens: 1024
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
		return new Response(JSON.stringify({ error: 'Error generating summary' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
