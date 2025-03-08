import { GEMINI_API } from '$env/static/private';

export const config = {
	maxDuration: 60
};
import OpenAI from 'openai';
/** @type {import('./$types').RequestHandler} */

function build_prompt(messages, patient, q, tasks) {
	messages.pop();
	let system_prompt;
	if (!patient) {
		system_prompt = 'You are a Health Education Assistant who provides simplified information.';
	} else {
		system_prompt = `You are a Health Education Assistant who provides simplified information. Answer the question for given patient data ${JSON.stringify(patient)},${JSON.stringify(q) || ''} and tasks ${JSON.stringify(tasks)}.`;
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
		apiKey: GEMINI_API
	});
	try {
		const { messages, patient, queue, tasks } = await request.json();
		let { pr } = build_prompt(messages, patient, queue, tasks);
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
// export async function POST({request}) {
//     const {values} = await request.json();
//     try {
//         const response = await fetch('https://api.openai.com/v1/chat/completions', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${OPENAI_API}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 model: 'gpt-3.5-turbo',
//                 messages: [
//                     { role: 'system', content: 'You are a helpful assistant  that answer question based data with a field like name of necessary information from given conversation between doctor and patient if conversation is not related to medical you return null.Do not assume anything.' },
//                     { role: 'user', content: `This is conversation between doctor and patient '${values}' If conversation is not related to medial question answering return null else return ehr data in form of json data with all necessary information and field with name.` }
//                 ],
//                 max_tokens: 1024,
//                 n: 1,
//                 temperature: 0.2
//             })
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         let report = data.choices[0].message.content.trim();
//         const pattern = /(```json)([\s\S]*?)(```)/;
//         const match = report.match(pattern);
//         if (match) {
//             report=match[2];
//         }

//         return new Response(JSON.stringify({ report }), {
//             headers: { 'Content-Type': 'application/json' }
//         });
//     } catch (error) {
//         console.log(error)
//         return new Response(JSON.stringify({ error: 'Error fetching Mermaid code' }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     }
// }
