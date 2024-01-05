const net = require("net");
//@ts-check
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage

const server = net.createServer((socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   

    socket.on('data', (data) => {
        console.log(data)
        socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        
    });

    socket.on("close", () => {
        socket.end();
        console.log('Desconectado.')
        server.close();
  });
    
});

server.listen(4221, "localhost");
