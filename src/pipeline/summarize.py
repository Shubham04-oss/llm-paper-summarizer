from transformers import pipeline

# load once at import
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


def summarize_text(text: str, max_tokens: int = 150) -> str:
    """Summarize given text into a shorter form."""
    if not text.strip():
        return "⚠️ No text to summarize."
    summary = summarizer(
        text[:1000], max_length=max_tokens, min_length=40, do_sample=False
    )
    return summary[0]["summary_text"]
