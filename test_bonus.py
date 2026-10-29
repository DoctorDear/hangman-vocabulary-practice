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

    def test_quit_round_returns_without_finishing(self):
        with patch('builtins.input', side_effect=['0']), redirect_stdout(io.StringIO()) as output:
            self.assertEqual(self.app.play_game(self.words), 'quit')
        self.assertIn('0 = menu', output.getvalue())
        self.assertNotIn('You lose!', output.getvalue())
        self.assertEqual(self.words, [{'word': 'cat', 'hint': 'A pet'}])

    def test_quit_round_returns_directly_to_main_menu(self):
        with patch('builtins.input', side_effect=['1', '0', '5']), redirect_stdout(io.StringIO()) as output:
            self.app.main()
        self.assertIn('Goodbye!', output.getvalue())

    def test_save_and_load_across_sessions(self):
        self.assertTrue(hasattr(self.app, 'save_words'))
        with redirect_stdout(io.StringIO()):
            self.assertTrue(self.app.save_words(self.words, self.path))
            other_session = []
            self.assertTrue(self.app.load_words(other_session, self.path))
        self.assertEqual(other_session, self.words)

    def run_main(self, inputs):
        with patch.object(self.app, '__file__', str(Path(self.folder.name) / 'main.py')), \
             patch('builtins.input', side_effect=inputs), redirect_stdout(io.StringIO()) as output:
            self.app.main()
        return output.getvalue()

    def test_startup_loads_saved_bank_and_manual_save_survives_restart(self):
        Path(self.path).write_text(json.dumps(self.words), encoding='utf-8')
        output = self.run_main(['3', '', '2', 'kiwi', 'Green fruit', '6', '5'])
        self.assertIn('cat (3 letters) - A pet', output)
        self.assertNotIn('apple (', output)
        output = self.run_main(['3', '', '5'])
        self.assertIn('kiwi (4 letters) - Green fruit', output)

    def test_startup_does_not_save_unsaved_edits(self):
        original = json.dumps(self.words)
        Path(self.path).write_text(original, encoding='utf-8')
        self.run_main(['2', 'kiwi', 'Green fruit', '4', 'cat', '5'])
        self.assertEqual(Path(self.path).read_text(encoding='utf-8'), original)
        output = self.run_main(['3', '', '5'])
        self.assertIn('cat (3 letters)', output)
        self.assertNotIn('kiwi (', output)

    def test_missing_or_bad_startup_file_keeps_empty_bank_and_allows_add(self):
        for content in [None, 'broken', '{}']:
            with self.subTest(content=content):
                if content is not None:
                    Path(self.path).write_text(content, encoding='utf-8')
                output = self.run_main(['1', '', '2', 'dog', 'A pet', '3', '', '5'])
                self.assertIn('Starting with an empty vocabulary.', output)
                self.assertIn('No words available.', output)
                self.assertIn('dog (3 letters) - A pet', output)
                if content is None:
                    self.assertFalse(Path(self.path).exists())
                else:
                    self.assertEqual(Path(self.path).read_text(encoding='utf-8'), content)

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

