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
                    // await page.waitForSelector('div.photo_area > ul > li.size_l > a', {timeout: 1500});
                    await page.waitForSelector('ul.list_review > li > a', {timeout: 1500});
                    // div.wrap_list > ul > li > a
                    const body = await page.evaluate(()=>{
                        let map = {};
                        const mainImgReference = document.querySelector('div.photo_area > ul > li.size_l > a')
                        const ref = document.querySelector('ul.list_review > li > a');
                        console.log(ref.getAttribute('href'));
                        let mainImgSource = mainImgReference.getAttribute('style');
                        mainImgSource = mainImgSource.substring(22, mainImgSource.length - 2);
                        const reviewLink = document.querySelectorAll('div.wrap_list > ul.list_review > li > a');
                        const reviewImg = document.querySelectorAll('div.wrap_list > ul.list_review > li > a > div > span.item_photo');
                        const reviewTitle = document.querySelectorAll('div.wrap_list > ul.list_review > li > a > div.review_story > strong');
                        const reviewContent = document.querySelectorAll('div.wrap_list > ul.list_review > li > a > div.review_story > p');
                        const category = document.querySelector('div.location_evaluation > span.txt_location');

                        let list = [];
                        for (let i = 0; i < reviewTitle.length; i++) {
                            list.push({
                                link: reviewLink[i].getAttribute('href'),
                                img: reviewImg[i].getAttribute('style').substring(22, reviewImg[i].getAttribute('style').length - 2),
                                title: reviewTitle[i].textContent,
                                content: reviewContent[i].textContent
                            })
                        }
                        map = {
                            img: mainImgSource,
                            category : category.textContent,
                            review: list
                        }
                        return map;
                        });
                        list.splice(idx,1,body);
                } catch(error){
                    list.splice(idx,1,"");
                }
            });
        }, {concurrency: 5});
    });
    // console.log(results);
    

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