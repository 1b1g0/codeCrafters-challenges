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
        //console.log(`Dir files: ${dirFiles}`)

        if (!dirFiles.includes(fileName)) {
            console.log('file not found')
            return false;
            
        } else {
            const fileContent = await readFile(`${path}${fileName}`);
            const fileLen = fileContent.length;
            return [fileLen, fileContent];
        }

    } catch (error) {
        console.log("Erro na função getFile:" + error.message);
    }
}

const getBody = async (reqHeader, socket) => {
    const path = reqHeader.target;
    const userAgent = reqHeader.userAgent.slice(12);
    const contentType = 'Content-Type: text/plain';

    if (path.length < 2) {
        return CRLF;
    }
    
    // /echo
    if (path.match(allowedPaths[0])) {

        const bodyContent = path.slice(6);
        const contentLen = bodyContent.length;
        //console.log(bodyContent)

        return `${lineSep}${contentType}${lineSep}Content-Length: 
        ${contentLen}${CRLF}${bodyContent}`;
    }

    // /user-agent
    if (path.match(allowedPaths[1])) {

        const contentLen = userAgent.length;

        return `${lineSep}${contentType}${lineSep}Content-Length: 
        ${contentLen}${CRLF}${userAgent}`;
    }
    
    // /files
    if (path.match(allowedPaths[2])) {
        
        try {
            const filePath = process.argv.slice(2)[1];
            //console.log(`File path: ${filePath}`);
    
            const contentTypeApp = 'Content-Type: application/octet-stream';
            
            //remover /files/
            const fileName = path.slice(7);
            //console.log(`File name: ${fileName}`);
            const fileInfo = await getFile(filePath, fileName);
            //console.log('File info: '+fileInfo)

            if (!fileInfo) {
                return false;
            } else {
                return `${lineSep}${contentTypeApp}${lineSep}Content-Length: 
            ${fileInfo[0]}${CRLF}${fileInfo[1]}`;
            }

            
        } 
        catch (error) {
            console.log('Erro buscando arquivos: '+error.message);
        }
       
        
    }
}
// '' = '/'
const allowedPaths = ['echo', 'user-agent', 'files', ''];

const server = net.createServer(async (socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   
    try {
        socket.on('data', async (data) => {
            const headers = data.toString().split(`\r\n`);
            const startLine = headers[0].split(' ', 3);

            const requestHeaders = {     
                'method': startLine[0],
                'target': startLine[1],
                'version': startLine[2],
                'userAgent': headers[2]
            };
            
            for (const line of headers) {               
                if (line == '') {
                    continue;
                }              
                if (line.match('HTTP') || line.match('Host') || line.match('User-Agent')){
                    continue;
                }
                
                const values = line.split(' ');
                requestHeaders[values[0]] = values[1];
            }
           
            
            const path = requestHeaders.target.split('/', 2)[1];
            const version = requestHeaders.version;
            
            
            //console.log(requestHeaders)

            const res404 = `${version} 404 Not Found${CRLF}`;

            if (!allowedPaths.includes(path)) {
                return socket.write(res404)
            }
            
            const body = await getBody(requestHeaders, socket);
            console.log('Retorno body:',body)
            if (!body) {
                return socket.write(res404);
            }
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
