import { GEMINI_API } from '$env/static/private';
import type { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { base64Encode } from '@firebase/util';
function toDataURL(url: string) {
	return fetch(url)
		.then((response) => response.blob())
		.then((blob) => blob.text().then((str) => base64Encode(str)));
}

async function build_prompt(
	messages: [{ isUser: boolean; text: string; image: string }],
	patient: string
) {
	messages.pop();

	let system_prompt;
	if (patient) {
		system_prompt = 'You are a Health Education Assistant who provides simplified information.';
	} else {
		system_prompt = `You are a Health Education Assistant who provides simplified information. Answer the question for given patient data ${JSON.stringify(patient)}`;
	}
	const pr: ChatCompletionMessageParam[] = [{ role: 'system', content: system_prompt }];
	for (let i = 0; i < messages.length; i++) {
		let message: ChatCompletionMessageParam;
		if (messages[i].image) {
			message = {
				role: 'user',
				content: [
					{ type: 'text', text: 'image' },
					{ type: 'image_url', image_url: messages[i].image }
				]
			};
		} else {
			message = {
				role: messages[i].isUser ? 'user' : 'assistant',
				content: [{ type: 'text', text: messages[i].text }]
			};
		}
		pr.push(message);
	}
	return { pr };
}
export const POST: RequestHandler = async ({ request }) => {
	const openai = new OpenAI({
		baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
		apiKey: GEMINI_API
	});
	try {
		const { messages, patient } = await request.json();
		const { pr }: { pr: ChatCompletionMessageParam[] } = await build_prompt(messages, patient);
		const completion = await openai.chat.completions.create({
			model: 'gemini-2.0-flash',

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
};
