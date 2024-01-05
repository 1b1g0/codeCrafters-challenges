//@ts-check

const net = require("net");
const { readdir, readFile } = require("fs/promises");
const CRLF = `\r\n\r\n`;
const lineSep = `\r\n`;

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const getFile = async (path, fileName) => {
    
    try {
        const dirFiles = await readdir(path);
        const file = dirFiles.find(file => file.match(fileName));
        if (!file) {
            return false;
        } else {
            const fileContent = await readFile(`${path}${fileName}`);
            fileLen = fileContent.length;
            return fileContent;
        }

    } catch (error) {
        console.log("Erro na função getFile:" + error.message);
    }
}

const getBody = (path, reqHeader) => {
    
    const contentType = 'Content-Type: text/plain';
    if (path.length < 2) {
        return CRLF;
    }
    
    // /echo
    if (path.match(allowedPaths[0])) {

        const bodyContent = path.slice(6);
        const contentLen = bodyContent.length;
        console.log(bodyContent)

        return `${lineSep}${contentType}${lineSep}Content-Length: ${contentLen}${CRLF}${bodyContent}`;
    }

    // /user-agent
    if (path.match(allowedPaths[1])) {
        const userAgent = reqHeader[2].slice(12);
        const contentLen = userAgent.length;

        return `${lineSep}${contentType}${lineSep}Content-Length: ${contentLen}${CRLF}${userAgent}`;
    }
    
    // /files
    if (path.match(allowedPaths[2])) {
        
        try {
            const args = process.argv.slice(2);
            const filePath = args[1];
    
            const contentTypeApp = 'Content-Type: application/octet-stream';
            
            //remover /files/
            const fileName = path.slice(7);
    
            const found = getFile(filePath, fileName);
            
            return `${lineSep}${contentTypeApp}${lineSep}Content-Length: ${fileLen}${CRLF}${found}`;
        } 
        catch (error) {
            console.log('Erro buscando arquivos: '+error.message);
        }
       
        
    }
}
let fileLen;
// '' = '/'
const allowedPaths = ['echo', 'user-agent', 'files', ''];

const server = net.createServer(async (socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   
    try {
        await socket.on('data', (data) => {
            const headers = data.toString().split(`\r\n`, 3);
            
            const startLine = headers[0].split(' ', 3);
            const path = startLine[1].split('/', 2)[1];
            const version = startLine[2];
            const res404 = `${version} 404 Not Found${CRLF}`;

            if (!allowedPaths.includes(path)) {
                return socket.write(res404)
            }
            
            const body = getBody(path, headers);
            const res200 = `${version} 200 OK${body}`;
            
            socket.write(res200);
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
