import io
import json
from pathlib import Path
import tempfile
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch
from test_hangman import load_app


class BonusTests(unittest.TestCase):
    def setUp(self):
        self.app = load_app()
        self.folder = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        self.addCleanup(self.folder.cleanup)
        self.path = str(Path(self.folder.name) / 'words.json')
        self.words = [{'word': 'cat', 'hint': 'A pet'}]

    def test_save_and_load_across_sessions(self):
        self.assertTrue(hasattr(self.app, 'save_words'))
        with redirect_stdout(io.StringIO()):
            self.assertTrue(self.app.save_words(self.words, self.path))
            other_session = []
            self.assertTrue(self.app.load_words(other_session, self.path))
        self.assertEqual(other_session, self.words)

    def test_invalid_file_preserves_current_vocabulary(self):
        self.assertTrue(hasattr(self.app, 'load_words'))
        for content in ['broken', '{}', '[1]', '[{"word":"cat","hint":""}]',
                        '[{"word":"café","hint":"animal"}]',
                        '[{"word":"cat","hint":"pet"},{"word":"CAT","hint":"pet"}]']:
            with self.subTest(content=content):
                Path(self.path).write_text(content, encoding='utf-8')
                with redirect_stdout(io.StringIO()):
                    self.assertFalse(self.app.load_words(self.words, self.path))
                self.assertEqual(self.words, [{'word': 'cat', 'hint': 'A pet'}])

    def test_missing_file_and_empty_bank(self):
        self.assertTrue(hasattr(self.app, 'load_words'))
        with redirect_stdout(io.StringIO()):
            self.assertFalse(self.app.load_words(self.words, self.path))
            self.assertTrue(self.app.save_words([], self.path))
            self.assertTrue(self.app.load_words(self.words, self.path))
        self.assertEqual(self.words, [])

    def test_failed_save_keeps_previous_file(self):
        self.assertTrue(hasattr(self.app, 'save_words'))
        Path(self.path).write_text('[]', encoding='utf-8')
        with patch.object(self.app.os, 'replace', side_effect=OSError('Read only')):
            with redirect_stdout(io.StringIO()):
                self.assertFalse(self.app.save_words(self.words, self.path))
        self.assertEqual(json.loads(Path(self.path).read_text(encoding='utf-8')), [])


if __name__ == '__main__':
    unittest.main()

