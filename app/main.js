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
    const stringData = data.toString();
    const arrayData = stringData.split("\r\n")
    const firstRequestPart = arrayData[0]

    const [METHOD_INDEX, PATH_INDEX, VERSION_INDEX] = [0, 1, 2];
    const firstRequestPartArray = firstRequestPart.split(" ")
    const path = firstRequestPartArray[PATH_INDEX]

    let userAgent = ""
    arrayData.map(data => {
      if (data.includes("User-Agent:")) {
        let splited = data.split(": ")
        userAgent = splited[1]
      }
    })
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
    } else if (path === "/user-agent") {
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}\r\n`)
    }
    else {
      socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
    }
    socket.end();
  });
});
server.listen(4221, "localhost");
