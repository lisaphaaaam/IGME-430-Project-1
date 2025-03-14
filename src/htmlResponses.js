const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const doc = fs.readFileSync(`${__dirname}/../client/doc.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// function to get the index page
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// function to get to doc page
const getDoc = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(doc);
  response.end();
};

// function to get css page
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// set out public exports
module.exports = {
  getIndex,
  getDoc,
  getCSS,
};
