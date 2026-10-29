import importlib.util
import io
from pathlib import Path
import runpy
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch


APP_PATH = Path(__file__).parent / "rush" / "main.py"


def load_app():
    assert APP_PATH.is_file(), f"Missing application: {APP_PATH}"
    spec = importlib.util.spec_from_file_location("hangman", APP_PATH)
    app = importlib.util.module_from_spec(spec)
    with patch("builtins.input", side_effect=AssertionError("Import must not prompt")):
        spec.loader.exec_module(app)
    return app


class HangmanTests(unittest.TestCase):
    def setUp(self):
        self.app = load_app()

    def run_inputs(self, function, inputs, *args):
        output = io.StringIO()
        with patch("builtins.input", side_effect=inputs), redirect_stdout(output):
            function(*args)
        return output.getvalue()

    def test_add_normalizes_word_and_hint(self):
        words = []
        output = self.run_inputs(self.app.add_word, [" DOG ", " Friendly pet "], words)
        self.assertEqual(words, [{"word": "dog", "hint": "Friendly pet"}])
        self.assertIn("Word added.", output)

    def test_add_rejects_duplicate_after_normalization(self):
        words = [{"word": "cat", "hint": "A pet"}]
        output = self.run_inputs(self.app.add_word, [" CAT ", "Unused hint"], words)
        self.assertEqual(words, [{"word": "cat", "hint": "A pet"}])
        self.assertIn("This word already exists.", output)

    def test_add_rejects_non_ascii_or_non_letter_words(self):
        for word in ["", "two words", "café", "cat1", "a-b"]:
            with self.subTest(word=word):
                words = []
                output = self.run_inputs(self.app.add_word, [word, "A hint"], words)
                self.assertEqual(words, [])
                self.assertIn("Enter a word using English letters only.", output)

    def test_add_rejects_blank_hint(self):
        words = []
        output = self.run_inputs(self.app.add_word, ["dog", "   "], words)
        self.assertEqual(words, [])
        self.assertIn("Hint cannot be empty.", output)

    def test_view_sorts_by_length_without_mutating_bank(self):
        words = [{"word": "python", "hint": "Language"},
                 {"word": "ox", "hint": "Farm animal"},
                 {"word": "cat", "hint": "A pet"}]
        original = words.copy()
        output = self.run_inputs(self.app.show_words, [""], words)
        rows = ["ox (2 letters) - Farm animal", "cat (3 letters) - A pet",
                "python (6 letters) - Language"]
        self.assertEqual(sorted(rows, key=output.index), rows)
        self.assertEqual(words, original)
        self.assertEqual([self.app.word_length(item) for item in words], [6, 2, 3])

    def test_search_matches_word_or_hint_case_insensitively(self):
        words = [{"word": "python", "hint": "A language"},
                 {"word": "cat", "hint": "A PET"}]
        for query, expected, excluded in [(" PYT ", "python", "cat"),
                                          (" pet ", "cat", "python")]:
            with self.subTest(query=query):
                output = self.run_inputs(self.app.show_words, [query], words)
                self.assertIn(expected + " (", output)
                self.assertNotIn(excluded + " (", output)

    def test_view_handles_no_matches_and_empty_bank(self):
        words = [{"word": "cat", "hint": "A pet"}]
        self.assertIn("No matching words.", self.run_inputs(self.app.show_words,
                                                           ["zzz"], words))
        self.assertIn("No words available.", self.run_inputs(self.app.show_words,
                                                            [""], []))

    def test_delete_normalizes_word_and_reports_missing(self):
        words = [{"word": "cat", "hint": "A pet"},
                 {"word": "dog", "hint": "Another pet"}]
        output = self.run_inputs(self.app.delete_word, [" CAT "], words)
        self.assertEqual(words, [{"word": "dog", "hint": "Another pet"}])
        self.assertIn("Word deleted.", output)
        output = self.run_inputs(self.app.delete_word, ["cat"], words)
        self.assertIn("Word not found.", output)
        self.assertEqual(len(words), 1)

    def test_empty_bank_cannot_start_game(self):
        with patch.object(self.app.random, "choice") as choose:
            output = self.run_inputs(self.app.play_game, [], [])
        choose.assert_not_called()
        self.assertIn("No words available.", output)

    def test_win_reveals_every_repeated_letter(self):
        item = {"word": "letter", "hint": "Written message"}
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, ["l", "e", "t", "r"], [item])
        self.assertIn("Written message", output)
        self.assertIn("______", output.replace(" ", ""))
        self.assertIn("lette_", output.replace(" ", ""))
        self.assertEqual(output.count("Correct!"), 4)
        self.assertIn("You win!", output)
        self.assertNotIn("You lose!", output)

    def test_six_distinct_wrong_guesses_lose(self):
        item = {"word": "cat", "hint": "A pet"}
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, list("bdefgh"), [item])
        self.assertEqual(output.count("Wrong!"), 6)
        self.assertIn("You lose! The word was:", output)
        self.assertIn("cat", output)
        self.assertNotIn("You win!", output)

    def test_invalid_and_duplicate_guesses_cost_no_life_at_boundary(self):
        item = {"word": "a", "hint": "First letter"}
        guesses = list("bcdef") + ["f", "", "ab", "1", "é", " A "]
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, guesses, [item])
        self.assertEqual(output.count("Wrong!"), 5)
        self.assertEqual(output.count("Enter one English letter."), 4)
        self.assertIn("You already guessed that letter.", output)
        self.assertIn("You win!", output)
        self.assertNotIn("You lose!", output)

    def test_repeated_correct_guess_is_case_insensitive(self):
        item = {"word": "abc", "hint": "First three letters"}
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, ["a", "A", "b", "c"], [item])
        self.assertEqual(output.count("Correct!"), 3)
        self.assertIn("You already guessed that letter.", output)
        self.assertIn("You win!", output)

    def test_hangman_drawing_progresses_through_all_seven_stages(self):
        self.assertTrue(hasattr(self.app, "draw_hangman"),
                        "Missing draw_hangman(mistakes) function")
        middle_rows = [
            ["      |", "      |", "      |"],
            ["  O   |", "      |", "      |"],
            ["  O   |", "  |   |", "      |"],
            ["  O   |", " /|   |", "      |"],
            ["  O   |", " /|\\  |", "      |"],
            ["  O   |", " /|\\  |", " /    |"],
            ["  O   |", " /|\\  |", " / \\  |"],
        ]
        for mistakes, rows in enumerate(middle_rows):
            with self.subTest(mistakes=mistakes):
                output = self.run_inputs(self.app.draw_hangman, [], mistakes)
                self.assertEqual(output.splitlines(),
                                 ["  +---+", "  |   |", *rows, "      |", "========="])

    def test_loss_displays_completed_hangman_before_loss_message(self):
        item = {"word": "cat", "hint": "A pet"}
        completed = "\n".join(["  +---+", "  |   |", "  O   |", " /|\\  |",
                               " / \\  |", "      |", "========="])
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, list("bdefgh"), [item])
        self.assertIn(completed, output)
        self.assertLess(output.index(completed), output.index("You lose! The word was:"))

    def test_invalid_and_duplicate_guesses_keep_same_hangman_drawing(self):
        item = {"word": "a", "hint": "First letter"}
        empty = "\n".join(["  +---+", "  |   |", "      |", "      |",
                           "      |", "      |", "========="])
        head_only = "\n".join(["  +---+", "  |   |", "  O   |", "      |",
                               "      |", "      |", "========="])
        with patch.object(self.app.random, "choice", return_value=item):
            output = self.run_inputs(self.app.play_game, ["b", "B", "1", "a"], [item])
        self.assertEqual(output.count(empty), 1)
        self.assertEqual(output.count(head_only), 4)
        self.assertEqual(output.count("Wrong!"), 1)
        self.assertIn("You win!", output)

    def test_clear_screen_uses_os_command_only_for_interactive_terminal(self):
        self.assertTrue(hasattr(self.app, "clear_screen"), "Missing clear_screen() function")
        for os_name, is_tty, term, expected in [("nt", True, None, "cls"),
                                               ("posix", True, "xterm", "clear"),
                                               ("posix", True, None, None),
                                               ("posix", True, "", None),
                                               ("posix", True, "dumb", None),
                                               ("nt", False, "xterm", None)]:
            with self.subTest(os_name=os_name, is_tty=is_tty):
                with patch.object(self.app.os, "name", os_name), \
                     patch.object(self.app.sys.stdout, "isatty", return_value=is_tty), \
                     patch.dict(self.app.os.environ, {} if term is None else {"TERM": term}, clear=True), \
                     patch.object(self.app.os, "system") as command:
                    self.app.clear_screen()
                if expected is None:
                    command.assert_not_called()
                else:
                    command.assert_called_once_with(expected)

    def test_redraw_keeps_frame_position_hint_and_latest_feedback(self):
        self.assertTrue(hasattr(self.app, "clear_screen"), "Missing clear_screen() function")
        item = {"word": "a", "hint": "First letter"}
        output = io.StringIO()
        frames = []
        guesses = iter(["b", "B", "1", "a"])

        def clear():
            output.seek(0)
            output.truncate(0)

        def guess(prompt):
            frames.append(output.getvalue())
            return next(guesses)

        with patch.object(self.app, "clear_screen", side_effect=clear), \
             patch.object(self.app.random, "choice", return_value=item), \
             patch("builtins.input", side_effect=guess), redirect_stdout(output):
            self.app.play_game([item])
        frames.append(output.getvalue())
        self.assertEqual(len(frames), 5)
        for frame in frames:
            self.assertEqual(frame.splitlines()[:3],
                             ["=== HANGMAN ===", "  +---+", "  |   |"])
            self.assertIn("Hint: First letter", frame)
            self.assertEqual(frame.count("=== HANGMAN ==="), 1)
        for frame, message in zip(frames[1:], ["Wrong!", "You already guessed that letter.",
                                               "Enter one English letter.", "Correct!"]):
            self.assertIn(message, frame)
        self.assertIn("Word: a", frames[-1])
        self.assertIn("You win!", frames[-1])

    def test_redraw_leaves_completed_loss_frame_visible(self):
        self.assertTrue(hasattr(self.app, "clear_screen"), "Missing clear_screen() function")
        item = {"word": "cat", "hint": "A pet"}
        output = io.StringIO()

        def clear():
            output.seek(0)
            output.truncate(0)

        with patch.object(self.app, "clear_screen", side_effect=clear), \
             patch.object(self.app.random, "choice", return_value=item), \
             patch("builtins.input", side_effect=list("bdefgh")), redirect_stdout(output):
            self.app.play_game([item])
        frame = output.getvalue()
        self.assertEqual(frame.splitlines()[:8],
                         ["=== HANGMAN ===", "  +---+", "  |   |", "  O   |",
                          " /|\\  |", " / \\  |", "      |", "========="])
        for text in ["Hint: A pet", "Mistakes: 6 / 6", "Wrong!",
                     "You lose! The word was: cat"]:
            self.assertIn(text, frame)
        self.assertEqual(frame.count("=== HANGMAN ==="), 1)

    def test_main_waits_for_enter_before_clearing_final_game_frame(self):
        self.assertTrue(hasattr(self.app, "clear_screen"), "Missing clear_screen() function")
        item = {"word": "a", "hint": "First letter"}
        output = io.StringIO()
        responses = iter(["1", "a", "", "5"])
        pause_frames = []

        def clear():
            output.seek(0)
            output.truncate(0)

        def answer(prompt):
            if prompt == "Press Enter to return to menu: ":
                pause_frames.append(output.getvalue())
            return next(responses)

        with patch.object(self.app, "clear_screen", side_effect=clear), \
             patch.object(self.app.random, "choice", return_value=item), \
             patch("builtins.input", side_effect=answer), redirect_stdout(output):
            self.app.main()
        self.assertEqual(len(pause_frames), 1)
        self.assertIn("You win!", pause_frames[0])
        self.assertIn("Hint: First letter", pause_frames[0])
        self.assertNotIn("HANGMAN VOCABULARY PRACTICE", pause_frames[0])
        self.assertIn("Goodbye!", output.getvalue())
        self.assertNotIn("You win!", output.getvalue())

    def test_main_handles_invalid_menu_and_exit(self):
        output = self.run_inputs(self.app.main, ["?", "", "5"])
        self.assertEqual(output.count("Invalid menu choice."), 2)
        self.assertIn("Goodbye!", output)

    def test_main_keeps_additions_and_deletions_during_session(self):
        choices = ["2", " kiwi ", " Green fruit ", "3", "KiWi",
                   "4", "KIWI", "3", "kiwi", "5"]
        output = self.run_inputs(self.app.main, choices)
        for message in ["Word added.", "kiwi (4 letters) - Green fruit",
                        "Word deleted.", "No matching words.", "Goodbye!"]:
            self.assertIn(message, output)

    def test_entry_point_exits_cleanly_on_eof_or_interrupt(self):
        for exception in [EOFError, KeyboardInterrupt]:
            with self.subTest(exception=exception.__name__):
                with patch("builtins.input", side_effect=exception), redirect_stdout(io.StringIO()):
                    runpy.run_path(str(APP_PATH), run_name="__main__")


if __name__ == "__main__":
    unittest.main()
