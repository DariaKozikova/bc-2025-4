const { program } = require('commander');
const fs = require('fs');
const http = require('http');

program
  .option('-i, --input <path>', 'path to the file we are giving for reading')
  .option('-h, --host <host>', 'server address')
  .option('-p, --port <port>', 'server port');

program.parse();

const options = program.opts(); 

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

if (!options.input || !options.host || !options.port) {
  console.error('Please provide all required parameters: --input, --host, --port');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const data = fs.readFileSync(options.input, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`📄 File contents:\n\n${data}`);
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
