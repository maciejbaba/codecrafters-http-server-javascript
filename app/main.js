const net = require("net");
const fs = require("fs");

const PORT = 4221;
const fileDir = process.argv[3];
// You can use print statements as follows for debugging, they'll be visible when running tests.

const createHttpResponse = ({message = "OK", contentLength = 0, statusCode = 200}) => {
  if (contentLength === 0) {
    return `HTTP/1.1 ${statusCode} ${message}\r\n\r\n`;
  }
  
  return `HTTP/1.1 ${statusCode} ${message}\r\nContent-Length: ${contentLength}\r\n\r\n`;
};

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    const stringData = data.toString();
    console.log(stringData);

    const arrayData = stringData.split("\r\n");

    const body = arrayData[arrayData.length - 1]

    const methodPathVersion = arrayData[0].split(" ");
    const method = methodPathVersion[0];
    const path = methodPathVersion[1];
    const version = methodPathVersion[2];

    let request = {
      method: method,
      path: path,
      version: version
    }

    if (path === "/") {
      const response = createHttpResponse({});
      socket.write(response);
    }

    let userAgent = "";
    let acceptEncoding = "";
    arrayData.map((data) => {
      if (data.includes("User-Agent:")) {
        let splited = data.split(": ");
        userAgent = splited[1];
      }
      if (data.includes("Accept-Encoding:")) {
        let splited = data.split(": ");
        acceptEncoding = splited[1];
      }
    });

    if (path === "/user-agent") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Encoding: ${acceptEncoding}\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}\r\n`,
      );
    }

    const echoPart = path.slice(0, 6);

    const restPart = path.slice(6);
    if (echoPart === "/echo/") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Encoding: ${acceptEncoding}\r\nContent-Type: text/plain\r\nContent-Length: ${restPart.length}\r\n\r\n${restPart}\r\n`,
      );
    } else if (method === "GET" && path.startsWith("/files")) {
      const fileName = path.split("/")[2];
      const filePath = `${fileDir}/${fileName}`;

      if (!fs.existsSync(filePath)) {
        socket.write("HTTP/1.1 404\r\n\r\n");
        socket.end();
      } else {
        const fileContent = fs.readFileSync(filePath);
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Encoding: ${acceptEncoding}\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`,
        );
        socket.end();
      }
    } else if (method === "POST" && path.startsWith("/files")) {
      const fileName = path.split("/")[2];
      const filePath = `${fileDir}/${fileName}`;
      fs.writeFileSync(filePath, body);
      const response = createHttpResponse({
        message: "Created",
        statusCode: 201
      })
      socket.write(response);
    } else {
      const response = createHttpResponse({
        message: "Not Found",
        statusCode: 404
      })
      socket.write(response);
    }
    socket.end();
  });
});
server.listen(PORT, "localhost");
