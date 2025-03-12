const fs = require('fs');
const querystring = require('querystring');

const countries = JSON.parse(fs.readFileSync('countries.json', 'utf-8'));

const respond = (request, response, status, content) => {
  const responseData = JSON.stringify(content);

  const contentType = 'application/json';

  response.writeHead(status, { 'Content-Type': contentType });

  // do not write body, just metadata
  if (request.method !== 'HEAD') {
    response.write(responseData);
  }

  response.end();
};

const getAllCountries = (request, response) => {
  respond(request, response, 200, countries);
};

const getAllRegions = (request, response) => {
  const regions = [...new Set(countries.map((country) => country.region))];
  respond(request, response, 200, regions);
};

const getCapital = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const country = url.searchParams.get('country');

  const found = countries.find((c) => c.name.toLowerCase() === country.toLowerCase());

  if (!country) {
    return respond(request, response, 400, { message: 'Country name is required', id: 'MissingParams' });
  }

  if (!found) {
    return respond(request, response, 404, { message: 'Country not found', id: 'notFound' });
  }

  return respond(request, response, 200, { capital: found.capital });
};

const getCountryName = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const capital = url.searchParams.get('capital');

  const found = countries.find((c) => c.capital.toLowerCase() === capital.toLowerCase());

  if (!capital) {
    return respond(request, response, 400, { message: 'Capital name is required', id: 'MissingParams' });
  }

  if (!found) {
    return respond(request, response, 404, { message: 'Capital not found', id: 'notFound' });
  }

  return respond(request, response, 200, { country: found.name });
};

const addVisited = (request, response) => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    try {
      let parsedBody;
      if (request.headers['content-type'] === 'application/json') {
        parsedBody = JSON.parse(body);
      } else {
        parsedBody = querystring.parse(body); 
      }

      const { visited: country } = parsedBody; 

      if (!country) {
        return respond(request, response, 400, { message: 'Country name is required', id: 'MissingParams' });
      }

      const found = countries.find((c) => c.name.toLowerCase() === country.toLowerCase());

      if (!found) {
        return respond(request, response, 404, { message: 'Country not found', id: 'notFound' });
      }

      if (typeof found.visited === 'undefined') {
        found.visited = false;
      }
      if (found.visited) {
        return respond(request, response, 200, { message: `${found.name} is already marked as visited` });
      }
      found.visited = true;

      fs.writeFileSync('countries.json', JSON.stringify(countries, null, 2), 'utf-8');

      return respond(request, response, 201, { message: `${found.name} marked as visited` });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return respond(request, response, 400, { message: 'Invalid JSON body', id: 'BadRequest' });
    }
  });
};

const addCountry = (request, response) => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    const parsedBody = JSON.parse(body);
    const { name, capital, region } = parsedBody;

    if (!name || !capital || !region) {
      return respond(request, response, 400, { message: 'Name, capital, and region are required', id: 'MissingParams' });
    }

    const exists = countries.some((c) => c.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      return respond(request, response, 400, { message: 'Country already exists', id: 'Conflict' });
    }

    const newCountry = {
      name, capital, region, visited: false,
    };
    countries.push(newCountry);

    return respond(request, response, 201, { message: 'Country added successfully', country: newCountry });
  });
};

// 404 other pages
const notFound = (request, response) => {
  const statusResponse = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  respond(request, response, 404, statusResponse);
};

module.exports = {
  getAllCountries,
  getAllRegions,
  getCapital,
  getCountryName,
  addVisited,
  addCountry,
  notFound,
};
