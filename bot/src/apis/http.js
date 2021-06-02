import { create } from "axios";

const http = create({
  baseURL: "https://bot-eliot-backend.herokuapp.com/"
});

// retorna o atributo data da resposta
http.interceptors.response.use(function(response) {
  return response.data;
});

export default http;
