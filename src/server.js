const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const responsesHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  //   '/style.css': htmlHandler.getCSS,
  //   '/success': responsesHandler.success,
  //   '/badRequest': responsesHandler.badRequest,
  //   '/unauthorized': responsesHandler.unauthorized,
  //   '/forbidden': responsesHandler.forbidden,
  //   '/internal': responsesHandler.internal,
  //   '/notImplemented': responsesHandler.notImplemented,
  notFound: responsesHandler.notFound,
};

// function to handle requests
const onRequest = (request, response) => {
  // first we have to parse information from the url
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  // Then we route based on the path that the user went to
  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }

  return urlStruct.notFound(request, response);
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
