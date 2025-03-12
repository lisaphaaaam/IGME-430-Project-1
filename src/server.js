const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const responsesHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/client.html': htmlHandler.getIndex,
  '/doc.html': htmlHandler.getDoc,
  '/style.css': htmlHandler.getCSS,
  '/api/getAllCountries': responsesHandler.getAllCountries,
  '/api/getAllRegions': responsesHandler.getAllRegions,
  '/api/getCapital': responsesHandler.getCapital,
  '/api/getCountryName': responsesHandler.getCountryName,
  '/api/addVisited': responsesHandler.addVisited,
  '/api/addCountry': responsesHandler.addCountry,
  notFound: responsesHandler.notFound,
};

// Function to parse JSON body
const parseBody = (request, response, callback) => {
  const body = [];

  request.on('error', (err) => {
    console.error('❌ Error receiving request body:', err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    try {
      const bodyString = Buffer.concat(body).toString();
      request.body = JSON.parse(bodyString); // Parse as JSON

      callback(request, response);
    } catch (error) {
      console.error('❌ Error parsing JSON:', error);
      response.statusCode = 400;
      response.end(JSON.stringify({ message: 'Invalid JSON body', id: 'BadRequest' }));
    }
  });
};

// Handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/api/addVisited') {
    parseBody(request, response, responsesHandler.addVisited);
  } else if (parsedUrl.pathname === '/api/addCountry') {
    parseBody(request, response, responsesHandler.addCountry);
  } else {
    responsesHandler.notFound(request, response);
  }
};

// function to handle requests
const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  }

  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }

  return urlStruct.notFound(request, response);
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
