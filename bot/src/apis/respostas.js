import http from "./http";

export function obterCategorias(frase) {
  return http.get(`/get`, {
    params: {
      msg: frase
    }
  });
  // .then(response => response);
}
