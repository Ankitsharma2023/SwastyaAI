// Handles AI processing using OpenAI (supports both audio and text input)

import { GEMINI_API } from '$env/static/private';
import OpenAI from 'openai';

export async function POST({ request }) {
	const formData = await request.formData();

	// Check if it's an audio file or text input
	const audio = formData.get("audio");
	const textData = formData.get("data");
	const prompt = formData.get("prompt");

	const openai = new OpenAI({
		apiKey: GEMINI_API,
		base_url: 'https://generativelanguage.googleapis.com/v1beta/openai/'
	});

	try {
		let transcript = textData; // Default to given text input (if available)

		// Step 1: If an audio file is received, transcribe it
		if (audio) {
			const transcriptionResponse = await openai.audio.transcriptions.create({
				model: "whisper-1", // Whisper AI auto-detects language
				file: audio,
				language: "auto"
			});
			transcript = transcriptionResponse.text; // Save transcribed text
			console.log("Transcribed Text:", transcript);
		}

		// Step 2: Process the text (from transcription or input)
		const processingResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a multilingual assistant. Detect the language (English or Hindi) of the following text and respond in the same language. Return JSON with a single field 'edited_text'.`
				},
				{ role: 'user', content: transcript || prompt }
			],
			max_tokens: 2048,
			temperature: 0.2
		});

		let processedText = processingResponse.choices[0].message.content.trim();

		return new Response(JSON.stringify({ transcript, processedText }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: "Error processing request" }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
