export const config = {
	maxDuration: 60
};
import { GEMINI_API } from '$env/static/private';

import OpenAI from 'openai';
/** @type {import('./$types').RequestHandler} */

function build_prompt(messages, patient) {
	messages.pop();
	let system_prompt;
	if (patient) {
		system_prompt = 'You are a Health Education Assistant who provides simplified information.';
	} else {
		system_prompt = `You are a Health Education Assistant who provides simplified information. Answer the question for given patient data ${JSON.stringify(patient)}`;
	}
	let pr = [{ role: 'system', content: system_prompt }];
	for (let i = 0; i < messages.length; i++) {
		let role = 'user';
		if (!messages[i].isUser) {
			role = 'assistant';
		}
		pr.push({ role: role, content: messages[i].text });
	}
	return { pr };
}
export async function POST({ request }) {
	const openai = new OpenAI({
		apiKey: GEMINI_API,
		base_url: 'https://generativelanguage.googleapis.com/v1beta/openai/'
	});
	try {
		const { messages, patient } = await request.json();
		let { pr } = build_prompt(messages, patient);
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: pr,
			temperature: 0.2,
			top_p: 0.7,
			max_tokens: 1024,
			stream: true
		});
		const stream = new ReadableStream({
			async pull(controller) {
				try {
					for await (const chunk of completion) {
						const content = chunk.choices[0]?.delta?.content || '';
						if (content) {
							controller.enqueue(new TextEncoder().encode(content));
						}
					}
					controller.close();
				} catch (error) {
					console.error('Error occurred:', error);
					controller.error(error);
				}
			}
		});

		return new Response(stream, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain',
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (error) {
		console.error('Error occurred:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
