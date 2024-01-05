const net = require("net");
const CRLF = `\r\n\r\n`;
//@ts-check
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const getBody = (path, content) => {
    const contentType = 'Content-Type: text/plain';
    const first = path.split('/', 2)[1];
    
    const offset = first.length + 2;// +2 = /first/
    const bContent = path.slice(offset);
    const contentLen = bContent.length;
    console.log(bContent)
    return `\r\n${contentType}\r\nContent-Length: ${contentLen}${CRLF}${bContent}`;
}
const server = net.createServer((socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   

    socket.on('data', (data) => {
        
        const lineSep = `\r\n`;
        const headers = data.toString().split(`\r\n`, 3);
        //console.log(headers)

        const startLine = headers[0].split(' ', 3);
        const method = startLine[0];
        const path = startLine[1];
        const version = startLine[2];
        console.log(`Method: ${method}\nPath: ${path}\nVesion: ${version}`)
       
        if (path.length < 2) {
            socket.write(`${version} 200 OK${CRLF}`)
        };

        const body = getBody(path);
        const res200 = `${version} 200 OK${body}`;
        const res404 = `${version} 404 Not Found${CRLF}`;
        
        //console.log(res200)
        
        path.match('/echo') ? socket.write(res200) : socket.write(res404);
    });

    socket.on("close", () => {
        socket.end();
        console.log('Desconectado.')
        server.close();
  });
    
});

server.listen(4221, "localhost");
