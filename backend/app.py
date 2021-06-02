from flask import Flask, render_template, request
from chatterbot import ChatBot
from chatterbot.logic import BestMatch
from chatterbot.trainers import ChatterBotCorpusTrainer
from chatterbot.comparisons import levenshtein_distance
from flask_cors import CORS

app = Flask(__name__)

cors = CORS(app)

path = "./data/portuguese"

app.config['CORS_HEADERS'] = 'Content-Type'

bot = ChatBot("Chatterbot", storage_adapter="chatterbot.storage.SQLStorageAdapter", logic_adapters=[{
        'import_path': 'chatterbot.logic.BestMatch',
        'default_response': 'Não entendi, pode repetir por favor?',
        'maximum_similarity_threshold': 0.90}])
trainer = ChatterBotCorpusTrainer(bot)
trainer.train(path)

@app.route("/")
def home():
     return render_template("index.html")

@app.route("/get")
def get_bot_response():
    userText = request.args.get('msg')
    return str(bot.get_response(userText))


if __name__ == "__main__":
    app.run()
