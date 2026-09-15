import json
import re
import sys


def analyse(text, language):
    text = str(text or '').strip()
    result = {
        'sentenceCount': 0,
        'tokenCount': 0,
        'flagCount': 0,
        'engine': 'spaCy + Indic NLP Library',
        'spacyAvailable': False,
        'indicNlpAvailable': False,
        'language': language,
        'flags': [],
    }

    # spaCy is used for robust tokenization. A blank multilingual pipeline is
    # sufficient for this local structural analysis and does not require a model download.
    try:
        import spacy
        nlp = spacy.blank('xx')
        doc = nlp(text)
        result['spacyAvailable'] = True
        result['tokenCount'] = len([t for t in doc if not t.is_space])
    except Exception:
        result['flags'].append('spaCy is not installed; install it for local token analysis.')
        result['tokenCount'] = len(re.findall(r"\b\w+\b", text, flags=re.UNICODE))

    # Indic NLP Library is used when available for Indian-language normalization.
    # It is intentionally optional here because its resource files are not required
    # for the rest of the quality pipeline to function.
    try:
        from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
        normalizer = IndicNormalizerFactory().get_normalizer(language.lower())
        normalized = normalizer.normalize(text)
        result['indicNlpAvailable'] = True
        text_for_sentence_check = normalized
    except Exception:
        text_for_sentence_check = text
        if language.lower() not in {'english', 'en'}:
            result['flags'].append('Indic NLP normalization was unavailable for this language.')

    # Sentence-level structural checks used alongside Gemini's semantic evaluation.
    sentences = [x.strip() for x in re.split(r'(?<=[.!?।॥])\s+', text_for_sentence_check) if x.strip()]
    result['sentenceCount'] = len(sentences)

    if not text:
        result['flags'].append('Content is empty.')
    if re.search(r'\s{2,}', text):
        result['flags'].append('Repeated whitespace detected.')
    if text and text[-1] not in '.!?।॥':
        result['flags'].append('Final sentence punctuation is missing.')
    if any(len(s.split()) > 45 for s in sentences):
        result['flags'].append('A sentence may be too long for public-facing clarity.')

    result['flagCount'] = len(result['flags'])
    return result


if __name__ == '__main__':
    payload = json.loads(sys.stdin.read() or '{}')
    print(json.dumps(analyse(payload.get('text', ''), payload.get('language', 'English')), ensure_ascii=False))
