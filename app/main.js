//@ts-check

const net = require("net");
const { readdir, } = require("fs/promises");
const CRLF = `\r\n\r\n`;
const lineSep = `\r\n`;
// todo: parse args
const args = process.argv.slice(2);
const filePath = args[1];
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const getBody = (path, reqHeader, files) => {
    const contentType = 'Content-Type: text/plain';
    if (path.length < 2) {
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
    
    if (path.match('/files')) {
        
        const contentTypeApp = 'Content-Type: application/octet-stream';
        const filename = path.slice(7);
        
        const found = files.find(file => file == filename);
        if (!found) {
            return false;
        } else {
            
            return `${lineSep}${contentTypeApp}${lineSep}Content-Length: ${found.length}${CRLF}${found}`;
        }
    }
}
const server = net.createServer(async (socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.', args)   
    try {
        const files = await readdir(filePath);
        await socket.on('data', (data) => {
            const headers = data.toString().split(`\r\n`, 3);
            
            const startLine = headers[0].split(' ', 3);
            const path = startLine[1];
            const version = startLine[2];

            const body = getBody(path, headers, files);
            const res200 = `${version} 200 OK${body}`;
            const res404 = `${version} 404 Not Found${CRLF}`;
            
            path.length < 2 ||
            path.match('/echo') ||
            path.match('/user-agent') ||
            body ?
            socket.write(res200) : socket.write(res404);
        });

        socket.on("close", () => {
            socket.end();
            console.log('Desconectado.')
            server.close();
    });
} catch (error) {
        console.log(error.message)
}
    
});

server.listen(4221, "localhost");
