import json
import os

FILE_NAME = "chats.json"


def save_chats(chats):

    serializable_chats = {}

    for chat_id, chat_data in chats.items():

        serializable_chats[chat_id] = {

            "title":
            chat_data["title"],

            "history":
            chat_data["history"]

        }

    with open(
        FILE_NAME,
        "w"
    ) as file:

        json.dump(
            serializable_chats,
            file,
            indent=4
        )


def load_chats():

    if not os.path.exists(
        FILE_NAME
    ):

        return {}

    with open(
        FILE_NAME,
        "r"
    ) as file:

        data = json.load(
            file
        )

    chats = {}

    for chat_id, chat_data in data.items():

        chats[chat_id] = {

            "documents": [],

            "faiss_index": None,

            "pdfs": set(),

            "history":
            chat_data[
                "history"
            ],

            "title":
            chat_data[
                "title"
            ]

        }

    return chats