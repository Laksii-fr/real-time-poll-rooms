"""
AI-powered poll generation using OpenAI completion API.
Returns a suggested question and options based on the user's prompt.
"""
import json
import re
from openai import OpenAI
from app.config import settings


SYSTEM_PROMPT = """You are a helpful assistant that creates single-question polls.
Given a topic or short description from the user, output exactly one poll with:
1. A clear, neutral question (5-200 characters).
2. Between 2 and 6 concise answer options (each under 100 characters).

Respond only with a single JSON object, no other text, in this exact format:
{"question": "Your question here?", "options": ["Option A", "Option B", "Option C"]}"""


def generate_poll_from_prompt(prompt: str) -> dict:
    """
    Call OpenAI to generate a poll question and options from a text prompt.
    Returns dict with keys: question (str), options (list of str).
    Raises ValueError if API key is missing or on parse/API errors.
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured. Add it to .env to use AI poll generation.")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt.strip()},
        ],
        temperature=0.7,
        max_tokens=500,
    )
    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise ValueError("AI returned an empty response.")

    # Extract JSON (handle optional markdown code block)
    json_str = content
    if "```" in content:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
        if match:
            json_str = match.group(1).strip()
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse AI response as JSON: {e}")

    question = (data.get("question") or "").strip()
    options_raw = data.get("options")
    if not isinstance(options_raw, list):
        raise ValueError("AI response must include an 'options' array.")
    options = [str(o).strip() for o in options_raw if str(o).strip()]
    if len(options) < 2:
        raise ValueError("AI must return at least 2 options.")
    if not question or len(question) < 5:
        raise ValueError("AI must return a question of at least 5 characters.")

    # Cap length to match backend limits
    question = question[:500]
    options = [o[:200] for o in options[:6]]

    return {"question": question, "options": options}
