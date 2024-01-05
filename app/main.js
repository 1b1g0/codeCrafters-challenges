const net = require("net");
//@ts-check
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage

const server = net.createServer((socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   

    socket.on('data', (data) => {
        const CRLF = `\r\n\r\n`;
        const headers = data.toString().split(' ');
        const method = headers[0];
        const path = headers[1];
        const version = headers[2].slice(0,8);
        console.log(`Method: ${method}\nPath: ${path}\nVesion: ${version}`)

        const res200 = `${version} 200 OK${CRLF}`;
        const res404 = `${version} 404 Not Found${CRLF}`;

        path == '/' ? socket.write(res200) : socket.write(res404);
        
        
    });

    socket.on("close", () => {
        socket.end();
        console.log('Desconectado.')
        server.close();
  });
    
});

server.listen(4221, "localhost");
