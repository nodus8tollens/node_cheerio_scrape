//INSTALL NODE
//INSTALL NPM
//RUN WITH "node index.js"

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const currentDirectory = path.dirname(__filename);
const outputDirectory = path.join(currentDirectory, "output");

//Create directory for .txt files
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
  console.log("Directory created successfully");
} else {
  console.log("Directory already exists");
}

// URL of the website you want to scrape
const url =
  "https://www.marketsandmarkets.com/Market-Reports/green-preservatives-market-15066985.html";
//Regex for extracting filename
const regex = /Reports\/(.*?)\-market/;
const match = url.match(regex);
const filename = match[1].split("-").join("_");
// Make an HTTP request to the website
axios
  .get(url)
  .then((response) => {
    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    //marketValueParagraph is the first <p> child of the container with ".reportTabContent" class
    const marketValueParagraph = $(".reportTabContent").children().first();

    //Create output file and write marketValueParagraph (add title/keyword for paragraph)
    const filePath = outputDirectory + `/${filename}.txt`;
    fs.writeFileSync(
      filePath,
      "SOURCE: Markets and Markets \n\nMARKET VALUE: \n" +
        marketValueParagraph.text().trim(),
      (err) => {
        if (err) {
          console.error("Error creating file: ", err);
        } else {
          console.log("File created: ", filePath);
        }
      }
    );

    // Select the <h3> above the "Drivers" <h4> and its adjacent <p>
    const marketDynamicsH3 = $('h3:contains("Market Dynamics")');

    // Find the <p> elements between the two <h4> elements
    const drivers = marketDynamicsH3.next().next();
    drivers.each((index, element) => {
      //Append content from <h3> and <p> elements containing "Market Drivers" information and add title/keyword
      fs.appendFileSync(
        filePath,
        "\nDRIVERS: \n" + $(element).text().trim(),
        (err) => {
          if (err) {
            console.error("Error creating file: ", err);
          } else {
            console.log("File created: ", filePath);
          }
        }
      );
    });
    //Select the <h3> before the "Segments" section and the <h3> before the "Key Market Players" section
    const ecosystemH3 = $('h3:contains("Ecosystem")');
    const playersH3 = $('h3:contains("Players")');
    //Extract all HTML between <h3> and <h4>
    const segments = ecosystemH3.nextUntil(playersH3, "h4");
    segments.each((index, element) => {
      //Append content from "Market Segment" section and add title/keyword
      fs.appendFileSync(
        filePath,
        "\nSEGMENTS: \n" + $(element).text().trim(),
        (err) => {
          if (err) {
            console.error("Error creating file: ", err);
          } else {
            console.log("File created: ", filePath);
          }
        }
      );
    });
    //Select the "Market Players" <p> that is adjacent to the <h3> containing "Players:"
    const marketPlayersParagraph = playersH3.next();
    //Append content from "Key Market Players" section and add title/keyword
    fs.appendFileSync(
      filePath,
      "\nKEY MARKET PLAYERS: \n" + marketPlayersParagraph.text().trim(),
      (err) => {
        if (err) {
          console.error("Error creating file: ", err);
        } else {
          console.log("File created: ", filePath);
        }
      }
    );
  })
  .catch((error) => {
    console.error("Error fetching the webpage:", error);
  });
