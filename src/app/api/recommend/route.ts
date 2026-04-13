import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { operation, material, hardness, machine, rpm, sfm, doc, woc, holder, priority, notes } = body

    const prompt = `You are an expert CNC tooling advisor with deep knowledge of cutting tools from all major manufacturers including Sandvik Coromant, Kennametal, Iscar, Seco Tools, Walter Tools, Mitsubishi Materials, Kyocera, and Sumitomo.

A machinist needs tooling recommendations for the following situation:

OPERATION: ${operation}
MATERIAL: ${material}${hardness ? ` (${hardness} HRC/HB)` : ''}
MACHINE: ${machine}
MAX RPM: ${rpm || 'Not specified'}
MAX SFM/CUTTING SPEED: ${sfm || 'Not specified'}
DEPTH OF CUT: ${doc || 'Not specified'}
WIDTH OF CUT / STEPOVER: ${woc || 'Not specified'}
TOOL HOLDER: ${holder || 'Not specified'}
PRIORITY: ${priority || 'Balanced performance'}
ADDITIONAL NOTES: ${notes || 'None'}

Provide exactly 5 ranked tooling recommendations. For each recommendation provide:
1. Rank (1-5, where 1 is best match)
2. Manufacturer name
3. Product line/series name
4. Specific insert grade or tool model
5. Why it's recommended for this application (2-3 sentences)
6. Recommended cutting speed (SFM or m/min)
7. Recommended feed rate (IPT or mm/tooth)
8. Expected tool life rating (Excellent/Good/Fair)
9. Price tier (Budget/Mid/Premium)
10. One key advantage
11. One potential limitation
12. Search term to find this product on MSC Industrial

Respond in valid JSON format only, no markdown, no explanation outside the JSON. Use this exact structure:
{
  "recommendations": [
    {
      "rank": 1,
      "manufacturer": "",
      "productLine": "",
      "grade": "",
      "reason": "",
      "cuttingSpeed": "",
      "feedRate": "",
      "toolLife": "",
      "priceTier": "",
      "advantage": "",
      "limitation": "",
      "mscSearch": ""
    }
  ],
  "summary": "One sentence summary of the overall recommendation strategy",
  "warnings": ["Any critical warnings or considerations as an array of strings, empty array if none"]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON from response
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
