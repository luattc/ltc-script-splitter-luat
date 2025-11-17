    import { NextResponse } from 'next/server';

    export async function POST(request) {
      try {
        const body = await request.json();
        const script = (body.script || '').toString();
        if (!script || script.trim().length === 0) {
          return NextResponse.json({ error: 'No script provided' }, { status: 400 });
        }

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
          return NextResponse.json({ error: 'OPENAI_API_KEY not set on the server' }, { status: 500 });
        }

        const prompt = `You are an assistant that splits a screenplay or script into numbered scenes.

Rules:\n- Respond with JSON only: {"scenes": ["scene 1 text", "scene 2 text", ...]}\n- Split when location or time changes, when characters change the setting, or roughly every 250-350 words if no obvious breaks.\n- Keep scene text readable and avoid cutting a paragraph in half.\n\nScript:\n"""\n${script}\n"""\n`;

        const payload = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a JSON-only assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.0,
          max_tokens: 2000
        };

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        const json = await r.json();
        if (!r.ok) {
          console.error('OpenAI error', json);
          return NextResponse.json({ error: 'OpenAI API error', details: json }, { status: 500 });
        }

        const text = json.choices?.[0]?.message?.content || '';

        // Try to get JSON out of the assistant response
        let scenes = [];
        try {
          const start = text.indexOf('{');
          const jsonText = start >= 0 ? text.slice(start) : text;
          const parsed = JSON.parse(jsonText);
          scenes = parsed.scenes || [];
        } catch (e) {
          // Fallback: naive splitting by double newline or '---'
          const parts = text.split(/\n-{3,}\n|\n\n/).map(s => s.trim()).filter(Boolean);
          if (parts.length > 1) scenes = parts;
          else {
            // Last resort: chunk original script by words
            const words = script.split(/\s+/);
            const chunkSize = 300;
            for (let i = 0; i < words.length; i += chunkSize) {
              scenes.push(words.slice(i, i + chunkSize).join(' '));
            }
          }
        }

        return NextResponse.json({ scenes });
      } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
      }
    }
