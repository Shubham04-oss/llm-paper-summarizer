import streamlit as st
from src.pipeline.pdf_io import extract_text
from src.pipeline.summarize import summarize_text

# Or, if 'summarize_text' is in a different location, update the import path accordingly.

st.set_page_config(page_title="Research Paper Summarizer", layout="wide")

st.title("📄 Research Paper Summarizer")

uploaded_file = st.file_uploader("Upload a PDF", type=["pdf"])

if uploaded_file is not None:
    with open("temp.pdf", "wb") as f:
        f.write(uploaded_file.read())

    text = extract_text("temp.pdf")
    st.subheader("Extracted Text (first 1000 chars)")
    st.text_area("Raw Text", text[:1000], height=200)

    if st.button("Summarize"):
        summary = summarize_text(text)
        st.subheader("Summary")
        st.write(summary)
