const http = require('http');
const curl = require("curl");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const hostname = '0.0.0.0';
const port = process.env.PORT || 80;

const server = http.createServer((req, res) => {
    getWHSMenu((items) => {
        if(items != null && items.length > 0) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
        } else {
            res.statusCode = 500;
            res.end();
        }
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function getWHSMenu(callback) {
    const url = "http://www.waylandschoolmeals.com/index.php?sid=1583875606329&page=menus";
    curl.get(url, null, (err,resp,body)=>{
        if(resp.statusCode == 200){
            getMenuId(body, callback);
        } else{
            console.log("error while fetching url");
        }
    });
}

function getMenuId(html, c){
    const dom = new JSDOM(html);
    const $ = (require('jquery'))(dom.window);

    let rel = $(".currentmonth").next().next().next().next().next().next().find("a").attr("href");
    let menuUrl = "http://www.waylandschoolmeals.com" + rel;
    curl.get(menuUrl, null, (err,resp,body)=>{
        if(resp.statusCode == 200){
            let hash = resp.request.uri.hash;
            let menuId = hash.split("?id=")[1].split("&")[0];
            queryMenuItems(menuId, c);
        } else{
            console.log("error while fetching url");
        }
    });
}

function queryMenuItems(menuId, c) {
    let url = `https://api.isitesoftware.com//graphql?query=%7Bmenu(id%3A%22${menuId}%22)%7Bmonth%20year%20items%7Bday%20product%7Bname%7D%7D%7D%7D`;
    curl.get(url, null, (err,resp,body)=>{
        if(resp.statusCode == 200 && body != null){
            getLunches(JSON.parse(body), c);
        } else{
            console.log("error while fetching url");
        }
    });
}

function getLunches(body, c) {
    let date = new Date();
    let dateDay = date.getDate(), dayNum = date.getDay();

    let itemsArr = body.data.menu.items;
    let lunchToday = itemsArr.filter((x) => { return x.day == dateDay });
    lunchToday = lunchToday.map(x => {return x.product.name.trim()});
    lunchToday = lunchToday.join("\n");

    let lunchTmrw = itemsArr.filter((x) => { return x.day == dateDay + 1 });
    lunchTmrw = lunchTmrw.map(x => {return x.product.name.trim()});
    lunchTmrw = lunchTmrw.join("\n");

    c([lunchToday, lunchTmrw]);
}
