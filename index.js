import { readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import { createServer } from "http";
import path from "path";



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


const DATA_FILE = path.join("data" , "links.json");

//following code se ham check kar rahe he 
//ki JSON FILE agar exist karti he to readkaro or return karo.
//agar exist nahi karti to write(create) karo then emty object return karo.
const loadlink =async () =>{
    try{
    const data1 = await readFile(DATA_FILE , "utf-8");
    if (data1.trim() === "") {
        // If file is empty, treat it as empty object
        return {};
    }
    return JSON.parse(data1);
    } 
    catch(error){
        if(error.code === "ENOENT"){
            await writeFile(DATA_FILE , JSON.stringify({}));
            return {};
        }
        throw error;
    }
}

//following function se ham data ko update kar rahe he JSON file me  
const savelinks =async (link)=>{
    await writeFile(DATA_FILE , JSON.stringify(link));
}

const server = createServer(async (req, res) => {
      console.log(req.url);

      if (req.method === "GET" && req.url === "/") {
        return servefile(res , path.join("public" , "index.html") , "text/html");
      }
      else if(req.method === "GET" && req.url === "/style.css"){
        return servefile(res , path.join("public" , "style.css") , "text/css");
      }
      else if(req.method === "GET" && req.url === "/links"){
        const link = await loadlink();
        res.writeHead(200 , {"Content-Type":"application/json"});
        return res.end(JSON.stringify(link));
      }
      


      if(req.method === "POST" && req.url === "/shorten"){
        const link = await loadlink();

        let body = "";
        req.on("data" , (chunk)=> {body += chunk });

        req.on("end" , async ()=>{
            const {url , shortcode} = JSON.parse(body);  
            //JSON.parse() = it convert JS object into json document.


            //agar kisi ne url nahi fill kiya to following code run hoga.
            if(!url){
                res.writeHead(400 ,  {"Content-Type":"text/html"});
                res.end("URL is required..");
                return; //to terminate or stop execution
            }

            //following code ka meaning he ki
            // if "shortcode" me data he to usko "finalShorturl" me store karo
            //else "shortcode" undefine ya empty he to "finalShorturl" me random 4-byte ka string store kardo
            //random stirng node.js ke crypto module se generate kar rahe he. 
            const finalShorturl = shortcode || crypto.randomBytes(4).toString("hex");


            //agar given shortcode already file me he to following code run hoga
            if(link[finalShorturl]){
                res.writeHead(400 , {"Content-Type" : "text/html"});
                res.end("ShortCode is already exist");
                return; //to terminate or stop execution
            }

            link[finalShorturl] = url;

            await savelinks(link);

            res.writeHead(200 , {"Content-Type":"application/json"});
            res.end(JSON.stringify({success:true , shortcode:finalShorturl}));
        })
      }else{
        const links = await loadlink();
        const shortcode = req.url.slice(1);

        //agar shortcode link file me he to redirect kar do
        if(links[shortcode]){
            res.writeHead(302 , {location : links[shortcode]});
            return res.end();
        }
        
        res.writeHead(404 ,{"Content-Type" : "text/html"});
        return res.end("Shortened URL is not found");

      }
    });


const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server is runing on http://localhost:${PORT}`);
});
