//@ts-check

const net = require("net");
const { readFile, writeFile } = require("fs/promises");
const { existsSync } = require("fs");
const CRLF = `\r\n\r\n`;
const lineSep = `\r\n`;

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const getFile = async (path, fileName) => {
    try {
        const fileContent = await readFile(`${path}${fileName}`);
        const fileLen = fileContent.length;
        return [fileLen, fileContent];

    } catch (error) {
        console.log("Erro na função getFile:" + error.message);
        return false;
    }
}

const getBody = async (reqHeader) => {
    // retorna [statuscode, conteudo]
    const path = reqHeader.target;
    const userAgent = reqHeader.userAgent.slice(12);
    const contentType = 'Content-Type: text/plain';

    if (path.length < 2) {

        return [200,CRLF];
    }
    
    // /echo
    if (path.match(allowedPaths[0])) {

        const bodyContent = path.slice(6);
        const contentLen = bodyContent.length;
        //console.log(bodyContent)

        return [200,`${lineSep}${contentType}${lineSep}Content-Length: 
        ${contentLen}${CRLF}${bodyContent}`];
    }

    // /user-agent
    if (path.match(allowedPaths[1])) {

        const contentLen = userAgent.length;

        return [200,`${lineSep}${contentType}${lineSep}Content-Length: 
        ${contentLen}${CRLF}${userAgent}`];
    }
    
    // /files
    if (path.match(allowedPaths[2])) {

        const dirPath = process.argv.slice(2)[1];
        const contentTypeApp = 'Content-Type: application/octet-stream';
        
        //remover '/files/'
        const fileName = path.slice(7);
        
        if (reqHeader.method == 'GET'){
            const fileExists = existsSync(dirPath + fileName);
            
            if (!fileExists) {
                return false;
            } else {
                try {
                    const fileInfo = await getFile(dirPath, fileName);
                    if (!fileInfo) {return false;}
                    return [200,`${lineSep}${contentTypeApp}${lineSep}Content-Length: 
                    ${fileInfo[0]}${CRLF}${fileInfo[1]}`];
                }
                catch (error) {
                    console.log('Erro buscando arquivos: '+error.message);
                }
            }
        }
        else if (reqHeader.method == 'POST'){
           // POST /files/<filename>
           // save it to <directory>/<filename>
           // 201 no body

            try {
                const content = reqHeader.Content;
                const writePromisse = await writeFile(path, content);
                
                return [201,'']; // arr size 2 expected
                
            } catch (error) {
                console.log(
                `Erro ao salvar o arquivo ${fileName}: ${error.message}`);
                return false;
            }
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
            const version = requestHeaders.version;
            const path = requestHeaders.target.split('/', 2)[1];
            const res404 = `${version} 404 Not Found${CRLF}`;

            if (!allowedPaths.includes(path)) {
                socket.write(res404)
                return socket.end();
            }

            // corrigir, adiciona conteudo do body
        
            for (const line in headers) {               
                if (headers[line] == '' || line < 2) {
                    continue;
                }              
            
                if (line == (headers.length - 1)){
                    requestHeaders['Content'] = headers[line].toString();
                    console.log('Conteudo do arquivo: ' + headers[line].toString());
                    break;
                }
                
                const values = headers[line].split(' ');
                requestHeaders[values[0].slice(-1)] = values[1];
            }
            console.log(requestHeaders);  

            const body = await getBody(requestHeaders);
            console.log('Retorno body: ',body)

            if (!body) {
                socket.write(res404);
                return socket.end(); 
            } 
            else {
                const res200 = `${version} ${body[0]} OK${body[1]}`;
                return socket.write(res200);
            }
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
