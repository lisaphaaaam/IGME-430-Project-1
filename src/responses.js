const fs = require('fs');

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
  const requestResponse = response.json(countries);

  respond(request, response, 200, requestResponse);
};

const getAllRegions = (request, response) => {
  const regions = [...new Set(countries.map((country) => country.region))];
  const requestResponse = response.json(regions);

  respond(request, response, 200, requestResponse);
};

const getCapital = (request, response) => {
  const { country } = request.query;
  const found = countries.find((c) => c.name.toLowerCase() === country.toLowerCase());

  let requestResponse = response.json({ capital: found.capital });

  if (!country) {
    requestResponse = response.json({ message: 'Country name is required', id: 'badRequest' });
    respond(request, response, 400, requestResponse);
  }

  if (!found) {
    requestResponse = response.json({ message: 'Country not found', id: 'notFound' });
    respond(request, response, 400, requestResponse);
  }

  respond(request, response, 200, requestResponse);
};

const getCountryName = (request, response) => {
  const { capital } = request.query;
  const found = countries.find((c) => c.capital.toLowerCase() === capital.toLowerCase());

  if (!capital) {
    respond(request, response, 400, response.json({ message: 'Capital name is required', id: 'badRequest' }));
  }

  if (!found) {
    respond(request, response, 404, response.json({ message: 'Capital not found', id: 'notFound' }));
  }

  respond(request, response, 200, response.json({ country: found.name }));
};

const addVisited = (request, response) => {
  const { country } = request.body;

  if (!country) {
    respond(request, response, 400, response.json({ message: 'Country name is required', id: 'badRequest' }));
  }
  const found = countries.find((c) => c.name.toLowerCase() === country.toLowerCase());
  if (!found) {
    respond(request, response, 404, response.json({ message: 'Country not found', id: 'notFound' }));
  }
  found.visited = true;

  respond(request, response, 201, response.json({ message: `${found.name} marked as visited` }));
};

const addCountry = (request, response) => {
  const { name, capital, region } = request.body;

  if (!name || !capital || !region) {
    respond(request, response, 400, response.json({ message: 'Name, capital, and region are required', id: 'badRequest' }));
  }
  const exists = countries.some((c) => c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    respond(request, response, 400, response.json({ message: 'Country already exists', id: 'conflict' }));
  }

  const newCountry = { name, capital, region };
  countries.push(newCountry);

  respond(request, response, 201, response.json({ message: 'Country added successfully', country: newCountry }));
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
