const puppeteer = require('puppeteer');
const bluebird = require("bluebird");

const scraperData = async function(req) {
    let urls = req.body.product_list;
    let list = req.body.product_list;

    const withBrowser = async (fn) => {
        const browser = await puppeteer.launch({headless : 'new'});
        try {
            return await fn(browser);
        } finally {
            await browser.close();
        }
    }
    
    const withPage = (browser) => async (fn) => {
        const page = await browser.newPage();
        try {
            return await fn(page);
        } finally {
            await page.close();
        }
    }

    const results = await withBrowser(async (browser) => {
        return bluebird.map(urls, async (url, idx) => {
            return withPage(browser)(async (page) => {
                await page.goto(url);
                try {
                    await page.waitForSelector('div.photo_area > ul > li.size_l > a', {timeout: 1500});
                    const body = await page.evaluate(()=>{
                        const imgReference = document.querySelector('div.photo_area > ul > li.size_l > a')
                        let imgSource = imgReference.getAttribute('style');
                        imgSource = imgSource.substring(22, imgSource.length - 2);
                        return imgSource;
                        });
                        list.splice(idx,1,body);
                } catch(error){
                    list.splice(idx,1,"");
                }
            });
        }, {concurrency: 5});
    });
    console.log(results);
    

    // 브라우저 실행
    // const broswer = await puppeteer.launch({
    //     headless : 'new',
    // });
    
    // const page = await broswer.newPage();
    
    // for (let url of req.body.product_list){
    //     await page.goto(url, {
    //         timeout: 1000
    //     });
    //     try {
    //         await page.waitForSelector('div.photo_area > ul > li.size_l > a', {timeout: 500});
    //         const body = await page.evaluate(()=>{
    //             const imgReference = document.querySelector('div.photo_area > ul > li.size_l > a')
    //             let imgSource = imgReference.getAttribute('style');
    //             imgSource = imgSource.substring(22, imgSource.length - 2);
    //             return imgSource;
    //             });
    //             list.push(body);
    //     } catch(error){
    //         list.push("");
    //     }
    //     // 이미지 스크랩하는 함수
    // }
    


    // 페이지에서 이미지 뜰때까지 대기
    // await new Promise((page) => setTimeout(page, 1000));
    

    return list;

}

module.exports.scraperData = scraperData;