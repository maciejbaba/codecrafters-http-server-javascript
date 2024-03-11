const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
  socket.on("data", (data) => {
    // raw buffer
    // console.log("data", data)

    // string
    const stringData = data.toString();
    console.log("stringData", stringData);

    const [method, path, version] = stringData.split(" ");
    console.log("stringData.split()", stringData.split(" "));

    const echoPart = path.slice(0, 6);
    console.log("echoPart", echoPart);

    const restPart = path.slice(6);
    console.log("restPart", restPart);
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (echoPart === "/echo/") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${restPart.length}\r\n\r\n${restPart}\r\n`,
      );
    } else {
      socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
    }
    socket.end();
  });
});
server.listen(4221, "localhost");
