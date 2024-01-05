const net = require("net");
const CRLF = `\r\n\r\n`;
const lineSep = `\r\n`;
//@ts-check
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const getBody = (path, reqHeader) => {
    const contentType = 'Content-Type: text/plain';
    if (path.length < 2){
        return CRLF;
    }
    
    if (path.match('/echo')) {
        const first = path.split('/', 2)[1];
        const offset = first.length + 2;// +2 = /first/
        const bodyContent = path.slice(offset);
        const contentLen = bodyContent.length;
        console.log(bodyContent)

        return `${lineSep}${contentType}${lineSep}Content-Length: ${contentLen}${CRLF}${bodyContent}`;
    }

    if (path.match('/user-agent')) {
        const userAgent = reqHeader[2].slice(12);
        const contentLen = userAgent.length;

        return `${lineSep}${contentType}${lineSep}Content-Length: ${contentLen}${CRLF}${userAgent}`;
    }
    
}
const server = net.createServer((socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   

    socket.on('data', (data) => {
        const headers = data.toString().split(`\r\n`, 3);
        
        const startLine = headers[0].split(' ', 3);
        const path = startLine[1];
        const version = startLine[2];

        const body = getBody(path, headers);
        const res200 = `${version} 200 OK${body}`;
        const res404 = `${version} 404 Not Found${CRLF}`;
        
        path.length < 2 || path.match('/echo') || path.match('/user-agent') ? socket.write(res200) : socket.write(res404);
    });

    socket.on("close", () => {
        socket.end();
        console.log('Desconectado.')
        server.close();
  });
    
});

server.listen(4221, "localhost");
