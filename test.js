


//following function se ham html & css file ko return karwa rahe he 
const servefile = async (res,filepath,content_type)=>{
    try{
        const data = await readFile(filepath);
        res.writeHead(200 , {"Content-Type":content_type});
        res.end(data);
    }
    catch (error){
        res.writeHead(404 , {"Content-Type":"text/html"});
        res.end("404 Page not found...");
    }
}


//following function se ham server create karke perticular url par konsa page show karna he vo bata rahe he 
const server = createServer(async (req, res) => {
  console.log(req.url);
  if (req.method === "GET" && req.url === "/") {
    return servefile(res , path.join("file_Serving/public" , "index.html") , "text/html");
  }
  else if(req.method === "GET" && req.url === "/style.css"){
    return servefile(res , path.join("file_Serving/public" , "style.css") , "text/css");
    
  }
});