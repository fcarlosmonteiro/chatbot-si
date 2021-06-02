import React, { useState, useEffect, useCallback } from "react";

import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

import styled from "styled-components";

import { Box, TextField, Button, IconButton } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";

import { obterCategorias } from "../apis/respostas";

import SpeechSynthesis from "./speechSynthesis";

const Header = styled.h2`
  color: #3f51b5;
`;

const Flex = styled(Box)`
  display: flex;
`;

const Message = styled(Box)`
  margin: 6px 0;
  padding: 4px;
  border-radius: 4px;
`;

const Chatbox = styled(Flex)`
  flex-direction: column;
  width: 400px;
  height: 400px;
  overflow: scroll;

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: lightslategray;
    border-radius: 6px;
  }
`;

const Icon = styled(IconButton)`
  padding: 10px !important;
  margin-right: 5px !important;
`;

const Bot = () => {
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState("");
  const [play, setPlay] = useState(true);
  const [scroll, setScroll] = useState(true); // update scroll to push Chatbox view to end

  setInterval(
    () => obterCategorias("").then(() => console.log("running...")),
    1800000
  );

  const speech = useSpeechRecognition();

  const handleFetch = frase => {
    if (frase.length > 0) {
      setMessages([...messages, { from: "user", frase }]);

      setState("");

      return obterCategorias(frase.toLowerCase()).then(response => {
        const speechSynthesis = new SpeechSynthesis({
          text: response,
          lang: "pt-BR",
          voice: "Google Portuguese"
        });
        speechSynthesis.onend(setPlay(false));
        speechSynthesis.speak();
        setPlay(true);
        setMessages(messages => [
          ...messages,
          { from: "bot", frase: response }
        ]);
        setScroll(!scroll);
      });
    }
  };

  useEffect(() => {
    let element = document.getElementById("teste");
    element.lastChild.scrollIntoView({
      block: "end",
      behavior: "smooth"
    });
  }, [scroll]);

  useEffect(() => {
    if (speech.listening) {
      setState(speech.transcript);
    }
  }, [speech.listening, speech.startListening]);

  const handleChange = e => setState(e.target.value);

  const handleEnter = e => e.key === "Enter" && handleFetch(state);

  return (
    <>
      <Header>Eliot</Header>
      <Flex
        justifyContent="center"
        textAlign="justify"
        flexDirection="column"
        alignItems="center"
      >
        <Chatbox id="teste" padding={2}>
          <Flex justifyContent="flex-end">
            <Message bgcolor="lightcoral">Diga alguma coisa!!</Message>
          </Flex>
          <Flex justifyContent="flex-end"></Flex>
          {messages.length > 0 &&
            messages.map(msg =>
              msg.from === "user" ? (
                <Flex justifyContent="flex-start">
                  <Message bgcolor="cornflowerblue">{msg.frase}</Message>
                </Flex>
              ) : (
                <Flex justifyContent="flex-end">
                  <Message bgcolor="lightcoral">{msg.frase}</Message>
                </Flex>
              )
            )}
        </Chatbox>
        <Flex width="400px" justifyContent="center">
          <Box flex={4} marginRight={1}>
            <TextField
              margin="none"
              fullWidth
              value={state}
              onKeyPress={handleEnter}
              onChange={handleChange}
              placeholder="message"
            ></TextField>
          </Box>
          <Icon
            padding={5}
            onClick={
              speech.listening
                ? () => speech.stopListening()
                : () => speech.startListening()
            }
            size="small"
          >
            <MicIcon
              color={speech.listening ? "error" : "primary"}
              fontSize="inherit"
            />
          </Icon>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleFetch(state)}
          >
            Enviar
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default Bot;
