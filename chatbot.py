from os import read
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from chatterbot.trainers import ChatterBotCorpusTrainer

path = "./data/portuguese"

chatbot = ChatBot("Chatterbot", read_only=True)

chatbot = ChatBot("Chatterbot", storage_adapter="chatterbot.storage.SQLStorageAdapter", logic_adapters=[{
        'import_path': 'chatterbot.logic.BestMatch',
        'statement_comparison_function': 'chatterbot.comparisons.levenshtein_distance',
        'default_response': 'Não entendi, pode repetir por favor?',
        'maximum_similarity_threshold': 0.90}])

#trainer = ChatterBotCorpusTrainer(chatbot)
#trainer.train(path)