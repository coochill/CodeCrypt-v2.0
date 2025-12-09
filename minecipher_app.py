import random
import tkinter as tk
from tkinter import messagebox

try:
    from wordfreq import top_n_list
except ImportError:
    top_n_list = None


class MineCipherApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("MineCipher")
        self.root.geometry("1200x760")
        self.root.configure(bg="#EDF5FF")
        self.root.resizable(False, False)

        self.word_bank = self.build_word_bank()

        self.difficulty_presets = {
            "Easy": (6, 15),
            "Medium": (10, 25),
            "Hard": (14, 35),
        }
        self.difficulty_word_length = {
            "Easy": 5,
            "Medium": 6,
            "Hard": 7,
        }
        self.selected_difficulty = "Medium"
        self.cipher_names = [
            "Affine Cipher",
            "Atbash Cipher",
            "Caesar Cipher",
            "Rail Fence Cipher",
            "ROT13 Cipher",
            "Vigenère Cipher",
        ]
        self.selected_cipher = self.cipher_names[0]
        self.cipher_examples = {
            "Affine Cipher": "Affine uses coefficients a=5, b=8. Message HELLO becomes MJQQT; decoding applies a⁻¹=21 and subtracts b to recover HELLO.",
            "Atbash Cipher": "Atbash mirrors A↔Z, B↔Y etc. Example: HELLO → SVOOL by swapping each letter across the alphabet.",
            "Caesar Cipher": "Caesar shifts by +3. HELLO becomes KHOOR; decoding shifts letters by -3 to get the original word.",
            "Rail Fence Cipher": "Rail Fence with depth 3 writes HELLO as HOELL when read row-wise; decoding re-interleaves the rows to reconstruct HELLO.",
            "ROT13 Cipher": "ROT13 rotates each letter by 13 places. HELLO → URYYB; applying ROT13 again returns the original.",
            "Vigenère Cipher": "Vigenère with key MINE shifts letters by key letters. Using key MINE, HELLO → TMYPA; decode by reversing each shift with the key.",
        }

        self.max_guesses = 5
        self.game_frame = tk.Frame(self.root, bg="#EDF5FF")
        self.home_frame = tk.Frame(self.root, bg="#EDF5FF")
        self.selection_frame = tk.Frame(self.root, bg="#EDF5FF")

        self.build_home_screen()
        self.build_selection_screen()
        self.build_game_interface()

        self.show_frame(self.home_frame)
        self.root.mainloop()

    def show_frame(self, frame):
        for f in (self.home_frame, self.selection_frame, self.game_frame):
            f.pack_forget()
        frame.pack(fill="both", expand=True)

    def build_word_bank(self):
        desired_lengths = {5, 6, 7}
        buckets = {length: [] for length in desired_lengths}
        if top_n_list:
            for word in top_n_list("en", 12000):
                upper = word.upper()
                length = len(upper)
                if length in buckets and upper.isalpha():
                    buckets[length].append(upper)
        fallback = {
            5: [
                "APPLE",
                "BRAVO",
                "DELTA",
                "FROST",
                "GAMMA",
                "HONEY",
                "IRONY",
                "JAZZY",
                "KNIFE",
                "ORBIT",
                "LEMON",
                "MANGO",
                "NINJA",
                "OPERA",
                "PIXEL",
                "QUEST",
                "RIVER",
                "SOLAR",
                "SWEET",
                "TABLE",
                "TIDES",
                "UNITY",
                "VIVID",
                "WISER",
                "XENON",
                "YIELD",
                "ZESTY",
            ],
            6: [
                "ORCHID",
                "FATHER",
                "PLANET",
                "SILVER",
                "RHYTHM",
                "FLOWER",
                "CIRCLE",
                "MYSTIC",
                "SPRING",
                "CRIMES",
            ],
            7: [
                "LIBERTY",
                "VOYAGER",
                "MYSTERY",
                "CRYSTAL",
                "HELIXES",
                "WEATHER",
                "JOURNEY",
            ],
        }
        for length in desired_lengths:
            combined = list(dict.fromkeys(buckets[length] + fallback.get(length, [])))
            buckets[length] = combined
        return buckets

    def build_home_screen(self):
        header = tk.Label(
            self.home_frame,
            text="MineCipher",
            font=("Helvetica", 40, "bold"),
            bg="#EDF5FF",
            fg="#1D4ED8",
        )
        header.pack(pady=(20, 5))
        subheader = tk.Label(
            self.home_frame,
            text="Solve the jumbled cipher hidden in the Minesweeper board!",
            font=("Helvetica", 16),
            bg="#EDF5FF",
            fg="#0F172A",
        )
        subheader.pack(pady=(0, 15))

        info_frame = tk.Frame(self.home_frame, bg="#EDF5FF")
        info_frame.pack(padx=40, pady=10, fill="x")

        win_card = self.make_info_card(
            info_frame,
            "Win Condition",
            "Reveal non-mine tiles, decode the cipher letters, then submit the final word without triggering a mine.",
        )
        lose_card = self.make_info_card(
            info_frame,
            "Lose Condition",
            "Hit a mine or use up five incorrect final-word guesses and the board will explode.",
        )
        win_card.pack(side="left", expand=True, padx=10)
        lose_card.pack(side="left", expand=True, padx=10)

        how_to_play = self.make_info_card(
            self.home_frame,
            "How to Play",
            "Click safe tiles to glimpse cipher letters. Use the hints to crack the transformed word, then submit your guess.",
        )
        how_to_play.pack(padx=40, pady=15, fill="x")

        diff_frame = tk.LabelFrame(
            self.home_frame,
            text="Select Difficulty",
            bg="#EDF5FF",
            font=("Helvetica", 14, "bold"),
            fg="#1D4ED8",
            padx=10,
            pady=10,
        )
        diff_frame.pack(pady=10)
        self.diff_buttons = {}
        for difficulty in self.difficulty_presets:
            btn = tk.Button(
                diff_frame,
                text=difficulty,
                width=12,
                relief="raised",
                bg="#FFFFFF",
                command=lambda diff=difficulty: self.select_difficulty(diff),
            )
            btn.pack(side="left", padx=10)
            self.diff_buttons[difficulty] = btn
        self.highlight_difficulty()

        play_button = tk.Button(
            self.home_frame,
            text="Play Now",
            font=("Helvetica", 16, "bold"),
            bg="#2563EB",
            fg="white",
            pady=8,
            command=self.show_selection_screen,
        )
        play_button.pack(pady=20)

    def build_selection_screen(self):
        header = tk.Label(
            self.selection_frame,
            text="Select a Cipher",
            font=("Helvetica", 36, "bold"),
            bg="#EDF5FF",
            fg="#1D4ED8",
        )
        header.pack(pady=20)

        grid_frame = tk.Frame(self.selection_frame, bg="#EDF5FF")
        grid_frame.pack(padx=40, pady=10)
        for idx, cipher in enumerate(self.cipher_names):
            btn = tk.Button(
                grid_frame,
                text=cipher,
                width=20,
                height=2,
                bg="#FFFFFF",
                fg="#0F172A",
                relief="groove",
                command=lambda name=cipher: self.start_game(name),
            )
            btn.grid(row=idx // 3, column=idx % 3, padx=10, pady=8)

        back_btn = tk.Button(
            self.selection_frame,
            text="Back",
            bg="#E0E7FF",
            fg="#0F172A",
            command=lambda: self.show_frame(self.home_frame),
        )
        back_btn.pack(pady=10)

    def build_game_interface(self):
        board_panel = tk.Frame(self.game_frame, bg="#EDF5FF")
        board_panel.grid(row=0, column=0, padx=20, pady=20)
        self.board_canvas = tk.Canvas(
            board_panel,
            width=760,
            height=520,
            bg="#DDE7FF",
            highlightthickness=0,
        )
        self.board_canvas.grid(row=0, column=0)
        self.board_scroll = tk.Scrollbar(
            board_panel, orient="horizontal", command=self.board_canvas.xview
        )
        self.board_scroll.grid(row=1, column=0, sticky="ew")
        self.board_canvas.configure(xscrollcommand=self.board_scroll.set)
        self.board_frame = tk.Frame(self.board_canvas, bg="#DDE7FF")
        self.board_canvas.create_window((0, 0), window=self.board_frame, anchor="nw")
        self.board_frame.bind(
            "<Configure>",
            lambda event: self.board_canvas.configure(
                scrollregion=self.board_canvas.bbox("all")
            ),
        )

        control_panel = tk.Frame(board_panel, bg="#EDF5FF")
        control_panel.grid(row=1, column=0, pady=(10, 0))
        new_board_btn = tk.Button(
            control_panel,
            text="New Board",
            bg="#1D4ED8",
            fg="white",
            width=12,
            command=self.restart_current_game,
        )
        new_board_btn.pack(side="left", padx=10)
        main_menu_btn = tk.Button(
            control_panel,
            text="Main Menu",
            bg="#E0E7FF",
            fg="#0F172A",
            width=12,
            command=lambda: self.show_frame(self.home_frame),
        )
        main_menu_btn.pack(side="left", padx=10)

        self.info_frame = tk.Frame(self.game_frame, bg="#FFFFFF", relief="raised", bd=2)
        self.info_frame.grid(row=0, column=1, sticky="n", padx=20, pady=20)
        cipher_label = tk.Label(
            self.info_frame,
            text="Cipher:",
            font=("Helvetica", 14, "bold"),
            bg="#FFFFFF",
            fg="#0F172A",
        )
        cipher_label.pack(padx=10, pady=(10, 0), anchor="w")
        self.cipher_name_label = tk.Label(
            self.info_frame,
            text=self.selected_cipher,
            font=("Helvetica", 16, "bold"),
            bg="#FFFFFF",
            fg="#2563EB",
        )
        self.cipher_name_label.pack(padx=10, anchor="w")
        self.cipher_example_label = tk.Label(
            self.info_frame,
            text="",
            wraplength=300,
            justify="left",
            bg="#FFFFFF",
            fg="#0F172A",
            font=("Helvetica", 11),
        )
        self.cipher_example_label.pack(padx=10, pady=(0, 10), anchor="w")
        self.update_cipher_example()

        self.status_var = tk.StringVar(value="Reveal safe tiles to collect cipher letters.")
        status_label = tk.Label(
            self.info_frame,
            textvariable=self.status_var,
            wraplength=280,
            bg="#FFFFFF",
            fg="#0F172A",
            justify="left",
        )
        status_label.pack(padx=10, pady=(0, 10))

        self.revealed_cipher_labels = []
        self.player_input_labels = []
        self.final_word_labels = []
        self.cipher_row_frame = tk.Frame(self.info_frame, bg="#F8FAFF")
        self.cipher_row_frame.pack(padx=10, pady=(10, 5), fill="x")
        self.input_row_frame = tk.Frame(self.info_frame, bg="#F8FAFF")
        self.input_row_frame.pack(padx=10, pady=5, fill="x")
        self.final_word_frame = tk.Frame(self.info_frame, bg="#F8FAFF")
        self.final_word_frame.pack(padx=10, pady=(5, 10), fill="x")

        self.guess_entry = tk.Entry(self.info_frame, font=("Helvetica", 14), width=18)
        self.guess_entry.pack(pady=(10, 5))
        self.guess_entry.bind("<KeyRelease>", self.on_guess_entry_change)
        guess_btn = tk.Button(
            self.info_frame,
            text="Submit Guess",
            bg="#2563EB",
            fg="white",
            command=self.submit_guess,
        )
        guess_btn.pack(pady=(0, 5))

        self.guess_status_label = tk.Label(
            self.info_frame,
            text=f"Guesses left: {self.max_guesses}",
            bg="#FFFFFF",
            fg="#0F172A",
            font=("Helvetica", 12),
        )
        self.guess_status_label.pack(pady=(0, 10))

    def make_info_card(self, parent, title, description):
        frame = tk.Frame(parent, bg="white", relief="groove", bd=2)
        header = tk.Label(
            frame,
            text=title,
            font=("Helvetica", 14, "bold"),
            bg="white",
            fg="#1D4ED8",
        )
        header.pack(padx=10, pady=(10, 5))
        body = tk.Label(
            frame,
            text=description,
            wraplength=320,
            justify="left",
            bg="white",
            fg="#0F172A",
        )
        body.pack(padx=10, pady=(0, 10))
        return frame

    def select_difficulty(self, difficulty):
        self.selected_difficulty = difficulty
        self.highlight_difficulty()

    def highlight_difficulty(self):
        for diff, btn in self.diff_buttons.items():
            style = "sunken" if diff == self.selected_difficulty else "raised"
            btn.config(relief=style)

    def show_selection_screen(self):
        self.show_frame(self.selection_frame)

    def restart_current_game(self):
        self.start_game(self.selected_cipher)

    def start_game(self, cipher_name):
        self.selected_cipher = cipher_name
        self.show_frame(self.game_frame)
        self.cipher_name_label.config(text=self.selected_cipher)
        self.update_cipher_example()
        self.setup_game_data()
        self.refresh_letter_rows()
        self.update_input_labels()
        self.render_board()
        self.update_status_line("Reveal safe tiles to collect cipher letters.")
        self.update_guess_status()
        self.guess_entry.config(state="normal")
        self.game_active = True
        self.board_cleared = False

    def setup_game_data(self):
        self.rows, self.cols = self.difficulty_presets[self.selected_difficulty]
        board, mine_count = self.generate_random_board(self.rows, self.cols)
        self.mine_count = mine_count
        self.numbers_board = self.number_mine_board(board)
        safe_positions = [idx for idx in range(self.rows * self.cols)
                          if board[idx // self.cols][idx % self.cols] != "M"]
        self.safe_cells_count = len(safe_positions)
        self.revealed_cells = set()
        self.flagged_cells = set()
        self.revealed_cipher_positions = set()

        word_length = self.difficulty_word_length.get(self.selected_difficulty, 5)
        candidates = self.word_bank.get(word_length, [])
        if not candidates:
            # fallback to 5-letter words if desired length missing
            candidates = self.word_bank.get(5, [])
        self.target_word = random.choice(candidates).upper()
        self.cipher_word = self.apply_cipher(self.target_word, self.selected_cipher)
        self.cell_cipher_letters = {}
        positions_for_letters = random.sample(safe_positions, len(self.target_word))
        for letter_index, (pos, cipher_letter, real_letter) in enumerate(
            zip(positions_for_letters, self.cipher_word, self.target_word)
        ):
            self.cell_cipher_letters[pos] = (cipher_letter, real_letter, letter_index)

        self.revealed_cipher_letters = ["" for _ in self.target_word]
        self.remaining_guesses = self.max_guesses

    def render_board(self):
        for widget in self.board_frame.winfo_children():
            widget.destroy()
        self.board_buttons = []
        for row in range(self.rows):
            for col in range(self.cols):
                idx = row * self.cols + col
                color = "#E5EDFF" if (row + col) % 2 == 0 else "#F4F7FF"
                button = tk.Button(
                    self.board_frame,
                    text=" ",
                    width=3,
                    height=1,
                    bg=color,
                    activebackground="#9EC5FF",
                    command=lambda idx=idx: self.handle_left_click(idx),
                )
                button.bind(
                    "<Button-3>",
                    lambda event, idx=idx: self.handle_right_click(idx),
                )
                button.grid(row=row, column=col, padx=1, pady=1)
                self.board_buttons.append(button)
        self.guess_entry.delete(0, tk.END)
        self.update_input_labels()
        for label in self.final_word_labels:
            label.config(text=" ")
            self.board_canvas.xview_moveto(0)
            self.board_canvas.configure(scrollregion=self.board_canvas.bbox("all"))

    def refresh_letter_rows(self):
        for frame in (
            self.cipher_row_frame,
            self.input_row_frame,
            self.final_word_frame,
        ):
            for widget in frame.winfo_children():
                widget.destroy()
        self.revealed_cipher_labels = []
        self.player_input_labels = []
        self.final_word_labels = []
        for _ in range(len(self.target_word)):
            label = tk.Label(
                self.cipher_row_frame,
                text="",
                width=3,
                height=2,
                relief="ridge",
                bg="#F3F4F6",
                font=("Helvetica", 14, "bold"),
            )
            label.pack(side="left", padx=2, pady=2)
            self.revealed_cipher_labels.append(label)

            input_label = tk.Label(
                self.input_row_frame,
                text="",
                width=3,
                height=2,
                relief="ridge",
                bg="#F3F4F6",
                font=("Helvetica", 14, "bold"),
            )
            input_label.pack(side="left", padx=2, pady=2)
            self.player_input_labels.append(input_label)

            final_label = tk.Label(
                self.final_word_frame,
                text="",
                width=3,
                height=2,
                relief="ridge",
                bg="#D1E8FF",
                font=("Helvetica", 14, "bold"),
            )
            final_label.pack(side="left", padx=2, pady=2)
            self.final_word_labels.append(final_label)

    def handle_left_click(self, idx):
        if not getattr(self, "game_active", True):
            return
        if idx in self.flagged_cells or idx in self.revealed_cells:
            return
        row, col = divmod(idx, self.cols)
        if self.numbers_board[row][col] == "M":
            self.reveal_mines()
            self.update_status_line("You hit a mine! Game over.")
            self.reveal_target_word()
            self.end_game(
                "Lost",
                "You hit a mine! Do you want to replay?",
                icon="warning",
            )
            return
        self.flood_fill(row, col)
        if len(self.revealed_cells) == self.safe_cells_count:
            self.board_cleared = True
            self.game_active = False
            self.update_status_line(
                "All safe tiles revealed.\nSubmit the final word to win the round."
            )

    def handle_right_click(self, idx):
        if not getattr(self, "game_active", True):
            return "break"
        button = self.board_buttons[idx]
        if idx in self.flagged_cells:
            button.config(text=" ", fg="black")
            self.flagged_cells.remove(idx)
        else:
            button.config(text="F", fg="red")
            self.flagged_cells.add(idx)
        return "break"

    def flood_fill(self, row, col):
        stack = [(row, col)]
        while stack:
            r, c = stack.pop()
            idx = r * self.cols + c
            if idx in self.revealed_cells:
                continue
            self.revealed_cells.add(idx)
            value = self.numbers_board[r][c]
            self.reveal_cell(idx, value)
            if idx in self.cell_cipher_letters:
                self.record_cipher_letter(idx)
            if value == "0":
                for dr in (-1, 0, 1):
                    for dc in (-1, 0, 1):
                        nr, nc = r + dr, c + dc
                        if (
                            0 <= nr < self.rows
                            and 0 <= nc < self.cols
                            and nr * self.cols + nc not in self.revealed_cells
                        ):
                            stack.append((nr, nc))

    def reveal_cell(self, idx, value):
        button = self.board_buttons[idx]
        display_text = "" if value == "0" else value
        button.config(text=display_text, bg="#8AB4FF", fg="#021F5F", state="disabled")

    def record_cipher_letter(self, idx):
        if idx in self.revealed_cipher_positions:
            return
        self.revealed_cipher_positions.add(idx)
        encoded, _, letter_index = self.cell_cipher_letters[idx]
        self.revealed_cipher_letters[letter_index] = encoded
        self.update_letter_displays()

    def update_letter_displays(self):
        for idx, label in enumerate(self.revealed_cipher_labels):
            letter = self.revealed_cipher_letters[idx] if idx < len(self.revealed_cipher_letters) else ""
            label.config(text=letter)

    def submit_guess(self):
        guess = self.guess_entry.get().strip().upper()
        if not guess:
            return
        if guess == self.target_word:
            for idx, char in enumerate(guess):
                self.final_word_labels[idx].config(text=char)
            self.guess_entry.delete(0, tk.END)
            self.guess_entry.config(state="disabled")
            self.end_game(
                "Win", "Correct! You solved the cipher. Play again?", icon="info"
            )
            return
        self.remaining_guesses -= 1
        self.update_guess_status()
        self.guess_entry.delete(0, tk.END)
        if self.remaining_guesses <= 0:
            self.reveal_mines()
            self.reveal_target_word()
            self.end_game(
                "Lost",
                "Out of guesses! The board has been revealed. Try again?",
                icon="warning",
            )
        else:
            self.update_status_line(
                f"Incorrect guess. {self.remaining_guesses} tries remaining."
            )

    def update_guess_status(self):
        self.guess_status_label.config(text=f"Guesses left: {self.remaining_guesses}")

    def on_guess_entry_change(self, event=None):
        self.update_input_labels()

    def update_input_labels(self):
        text = self.guess_entry.get().strip().upper()
        for idx, label in enumerate(self.player_input_labels):
            label_text = text[idx] if idx < len(text) else ""
            label.config(text=label_text)
        if len(text) > len(self.player_input_labels):
            self.guess_entry.delete(len(self.player_input_labels), tk.END)

    def update_status_line(self, text):
        self.status_var.set(text)

    def update_cipher_example(self):
        example = self.cipher_examples.get(self.selected_cipher, "")
        self.cipher_example_label.config(text=example)

    def reveal_mines(self):
        for idx in range(self.rows * self.cols):
            row, col = divmod(idx, self.cols)
            if self.numbers_board[row][col] == "M":
                button = self.board_buttons[idx]
                button.config(text="M", bg="#F87171", state="disabled")

    def reveal_target_word(self):
        for idx, label in enumerate(self.final_word_labels):
            label.config(text=self.target_word[idx])

    def generate_random_board(self, rows, cols):
        choices = ["E", "E", "E", "E", "E", "M"]
        board = [[None for _ in range(cols)] for _ in range(rows)]
        mine_count = 0
        for r in range(rows):
            for c in range(cols):
                cell = random.choice(choices)
                board[r][c] = cell
                if cell == "M":
                    mine_count += 1
        return board, mine_count

    def number_mine_board(self, board):
        rows = len(board)
        cols = len(board[0])
        numbered = [["0" for _ in range(cols)] for _ in range(rows)]
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "M":
                    numbered[r][c] = "M"
                    for dr in range(-1, 2):
                        for dc in range(-1, 2):
                            nr, nc = r + dr, c + dc
                            if 0 <= nr < rows and 0 <= nc < cols:
                                if board[nr][nc] == "M":
                                    continue
                                numbered[nr][nc] = str(int(numbered[nr][nc]) + 1)
        return numbered

    def apply_cipher(self, word, cipher_name):
        transformers = {
            "Affine Cipher": self.affine_encode,
            "Atbash Cipher": self.atbash_encode,
            "Base64 Encoding": lambda text: self.shift_text(text, 4),
            "Binary Encoding": lambda text: self.shift_text(text, 2),
            "Caesar Cipher": lambda text: self.shift_text(text, 3),
            "Hexadecimal Encoding": lambda text: self.shift_text(text, 9),
            "Morse Code": lambda text: self.shift_text(text, 5),
            "Rail Fence Cipher": lambda text: self.shift_text(text, 7),
            "ROT13 Cipher": lambda text: self.shift_text(text, 13),
            "Vigenère Cipher": lambda text: self.vigenere_encode(text, "MINE"),
        }
        enc = transformers.get(cipher_name, lambda text: self.shift_text(text, 3))
        return enc(word)

    def shift_text(self, text, shift):
        result = []
        for char in text:
            if char.isalpha():
                new_code = (ord(char) - 65 + shift) % 26 + 65
                result.append(chr(new_code))
            else:
                result.append(char)
        return "".join(result)

    def affine_encode(self, text):
        a, b = 5, 8
        return "".join(
            chr(((a * (ord(char) - 65) + b) % 26) + 65) for char in text
        )

    def atbash_encode(self, text):
        return "".join(chr(90 - (ord(char) - 65)) for char in text)

    @staticmethod
    def vigenere_encode(text, key):
        """Vigenère cipher encoding"""
        if not key:
            raise ValueError("Vigenère cipher requires a key")

        key = key.upper()
        result = ""
        key_index = 0

        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                shift = ord(key[key_index % len(key)]) - ord('A')
                result += chr((ord(char) - start + shift) % 26 + start)
                key_index += 1
            else:
                result += char

        return result

    def end_game(self, result, prompt, icon="info"):
        self.game_active = False
        title = "You Won!" if result == "Win" else "Game Over"
        response = messagebox.askyesno(title, prompt, icon=icon)
        if response:
            self.start_game(self.selected_cipher)
        else:
            self.show_frame(self.home_frame)


if __name__ == "__main__":
    MineCipherApp()
