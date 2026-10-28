import os
import random
import sys


def word_length(item):
    return len(item["word"])


def add_word(words):
    word = input("New English word: ").strip().lower()

    if not word.isascii() or not word.isalpha():
        print("Enter a word using English letters only.")
        return

    for item in words:
        if item["word"] == word:
            print("This word already exists.")
            return

    hint = input("Hint: ").strip()
    if not hint:
        print("Hint cannot be empty.")
        return

    words.append({"word": word, "hint": hint})
    print("Word added.")


def show_words(words):
    if not words:
        print("No words available.")
        return

    keyword = input("Search word or hint (Enter for all): ").strip().lower()
    found = False

    print("Words from shortest to longest:")
    for item in sorted(words, key=word_length):
        if keyword in item["word"] or keyword in item["hint"].lower():
            print(f"{item['word']} ({len(item['word'])} letters) - {item['hint']}")
            found = True

    if not found:
        print("No matching words.")


def delete_word(words):
    word = input("Word to delete: ").strip().lower()

    for item in words:
        if item["word"] == word:
            words.remove(item)
            print("Word deleted.")
            return

    print("Word not found.")


def clear_screen():
    if sys.stdout.isatty():
        os.system("cls" if os.name == "nt" else "clear")


def draw_hangman(mistakes):
    head = "O" if mistakes >= 1 else " "
    body = "|" if mistakes >= 2 else " "
    left_arm = "/" if mistakes >= 3 else " "
    right_arm = "\\" if mistakes >= 4 else " "
    left_leg = "/" if mistakes >= 5 else " "
    right_leg = "\\" if mistakes >= 6 else " "

    print("  +---+")
    print("  |   |")
    print(f"  {head}   |")
    print(f" {left_arm}{body}{right_arm}  |")
    print(f" {left_leg} {right_leg}  |")
    print("      |")
    print("=========")


def play_game(words):
    if not words:
        print("No words available.")
        return

    item = random.choice(words)
    word = item["word"]
    guesses = []
    mistakes = 0
    message = ""

    while True:
        clear_screen()
        print("=== HANGMAN ===")
        draw_hangman(mistakes)
        print("Hint:", item["hint"])

        display = ""
        for letter in word:
            if letter in guesses:
                display += letter + " "
            else:
                display += "_ "

        print("Word:", display.strip())
        print("Guessed letters:", " ".join(guesses))
        print("Mistakes:", mistakes, "/ 6")
        print(message)

        if "_" not in display:
            print("You win!")
            return
        if mistakes >= 6:
            print("You lose! The word was:", word)
            return

        guess = input("Guess one letter: ").strip().lower()
        if len(guess) != 1 or not guess.isascii() or not guess.isalpha():
            message = "Enter one English letter."
        elif guess in guesses:
            message = "You already guessed that letter."
        else:
            guesses.append(guess)
            if guess in word:
                message = "Correct!"
            else:
                mistakes += 1
                message = "Wrong!"


def main():
    words = [
        {"word": "cat", "hint": "A small pet that says meow"},
        {"word": "apple", "hint": "A red or green fruit"},
        {"word": "python", "hint": "A popular programming language"},
        {"word": "banana", "hint": "A long yellow fruit"},
        {"word": "school", "hint": "A place where students learn"},
    ]

    while True:
        print("\n=== HANGMAN VOCABULARY PRACTICE ===")
        print("1. Play Hangman")
        print("2. Add word")
        print("3. View / search words")
        print("4. Delete word")
        print("5. Exit")
        choice = input("Choose: ").strip()

        if choice == "1":
            play_game(words)
            input("Press Enter to return to menu: ")
            clear_screen()
        elif choice == "2":
            add_word(words)
        elif choice == "3":
            show_words(words)
        elif choice == "4":
            delete_word(words)
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid menu choice.")


if __name__ == "__main__":
    try:
        main()
    except (EOFError, KeyboardInterrupt):
        print("\nGoodbye!")
