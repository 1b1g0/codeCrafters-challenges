const net = require("net");
//@ts-check
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage

// Accept a TCP connection
// Read data from the connection (we'll get to parsing it in later stages)
// Respond with HTTP/1.1 200 OK\r\n\r\n (there are two \r\ns at the end)
// HTTP/1.1 200 OK is the HTTP Status Line.
// \r\n, also known as CRLF, is the end-of-line marker that HTTP uses.
// The first \r\n signifies the end of the status line.
// The second \r\n signifies the end of the response headers section (which is empty in this case).

const server = net.createServer((socket) => {
    // 'ouvindo' conexoes
    console.log('Conectado com sucesso.')   

    socket.on('data', (data) => {
        console.log(typeof data)
        socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        
    });

    socket.on("close", () => {
        socket.end();
        console.log('Desconectado.')
        server.close();
  });
    
});

server.listen(4221, "localhost");
