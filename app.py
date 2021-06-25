from chatbot import chatbot
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from fastapi.templating import Jinja2Templates


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/")
def home():
    return templates.TemplateResponse("item.html")
