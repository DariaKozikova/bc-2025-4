const { program } = require('commander');
const fs = require('fs');
const http = require('http');
const { XMLBuilder } = require('fast-xml-parser');

program
  .option('-i, --input <path>', 'path to the JSON file')
  .option('-h, --host <host>', 'server address')
  .option('-p, --port <port>', 'server port');

program.parse();
const options = program.opts();

if (!options.input || !options.host || !options.port) {
  console.error('Please provide all required parameters: --input, --host, --port');
  process.exit(1);
}

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  try {
    const content = await fs.promises.readFile(options.input, 'utf-8');
    const data = JSON.parse(content);

    const url = new URL(req.url, `http://${options.host}:${options.port}`);
    const showHumidity = url.searchParams.get('humidity') === 'true';
    const minRainfall = url.searchParams.get('min_rainfall')
      ? parseFloat(url.searchParams.get('min_rainfall'))
      : null;

    const filteredData = data
      .filter(record => !minRainfall || record.Rainfall > minRainfall)
      .map(record => {
        const newRecord = {
          rainfall: record.Rainfall,
          pressure3pm: record.Pressure3pm
        };
        if (showHumidity) newRecord.humidity = record.Humidity3pm;
        return newRecord;
      });

    const builder = new XMLBuilder({ format: true });
    const xml = builder.build({ weather_data: { record: filteredData } });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
