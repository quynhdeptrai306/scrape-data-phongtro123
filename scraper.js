const scrapeCategory=async (browser,url)=>new Promise(async(resolve,reject)=>{
    {
        try {
            let page = await browser.newPage();
            console.log('>> đang mở trình duyệt ...')
            await page.goto(url);
            console.log('>> đang truy cập đến url:'+url);
            await page.waitForSelector('#webpage');
            console.log('>> Wed đã load xong');

            //chọc vào lấy dữ liệu khi load xong
            const dataCategory = await page.$$eval('#navbar-menu > ul > li',els=>{
                dataCategory = els.map(el=>{
                    return {
                        category:el.querySelector('a').innerText,
                        link:el.querySelector('a').href
                    }
                })
                return dataCategory
            })
            console.log(dataCategory);


            await page.close()
            console.log('>>tab đã close');
            


            resolve(dataCategory)
        } catch (error) {
            console.log('lỗi ở scrape category'+error)
            reject(error)
        }
    }
})

const scraper= (browser,url)=> new Promise(async(resolve,reject)=>{
    {
        try {
            let newPage = await browser.newPage()
            console.log('>> đã mở tab mới...')
            await newPage.goto(url)
            console.log('>> đang truy cập đến url:'+url)
            await newPage.waitForSelector('#main')
            console.log('>> Wed đã load tag main xong')
            const scraperData={}
            //lấy header 
            const headerData = await newPage.$eval('header',(el)=>{
                return {
                    title:el.querySelector('h1').innerText,
                    description :el.querySelector('p').innerText
                }
            })
            scraperData.header=headerData
            // lấy link detail item
            const detailLinks = await newPage.$$eval('#left-col > section.section-post-listing > ul >li',(els)=>{
                detailLinks= els.map(el=>{
                    return el.querySelector('.post-meta > h3 > a').href
                })
                return detailLinks
            })
            
            // console.log(detailLinks); 

            const scraperDetail = async (link) => new Promise(async(resolve, reject) => {
                try {
                    let pageDetail = await  browser.newPage()
                    await pageDetail.goto(link)
                    console.log(' >> truy cập '+link);
                    await pageDetail.waitForSelector('#main')

                    const detailData={}
                    // bắt đầu cào
                    // cào ảnh
                    const images= await pageDetail.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide',(els)=>{
                        const validEls = els.filter((el)=>el!=null)
                        images= validEls.map((el)=>{
                            const imageElement= el.querySelector('img')
                            return imageElement?imageElement.src:null
                        })
                        return images
                    })
                    detailData.images=images
                    // cào header
                    const header= await pageDetail.$eval('header.page-header',(el)=>{
                        return {
                            title:el.querySelector('h1 > a').innerText,
                            start: el.querySelector('h1 > span').className.replace(/^\D+/g, ''),
                            class: {
                                content:el.querySelector('p').innerText,
                                classType: el.querySelector('p > a > strong').innerText
                            },
                            address: el.querySelector('address').innerText,
                            attributes:{
                                price: el.querySelector('div.post-attributes > .price > span').innerText,
                                acreage: el.querySelector('div.post-attributes > .acreage > span').innerText,
                                published: el.querySelector('div.post-attributes > .published > span').innerText,
                                hashtag: el.querySelector('div.post-attributes > .hashtag > span').innerText   
                            }
                        }
                    })
                    detailData.header=header
                    // cào thông tin mô tả
                    const mainContentHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-main-content',(el)=>el.querySelector('div.section-header > h2').innerText)

                    const mainContentContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-main-content > .section-content > p',(els)=> els.map(el=>el.innerText))

                    detailData.mainContent={
                        header:mainContentHeader,
                        content:mainContentContent
                    }

                    const overviewHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-overview',(el)=>el.querySelector('div.section-header > h3').innerText)

                    const overviewContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-overview > .section-content > table.table > tbody > tr',(els)=>els.map(el=>({
                        name:el.querySelector('td:first-child').innerText,
                        content:el.querySelector('td:last-child').innerText
                    })))

                    detailData.overview={
                        header:overviewHeader,
                        content:overviewContent
                    }

                    //thông tin liên hệ

                    const contactHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-contact',(el)=>el.querySelector('div.section-header > h3').innerText)

                    const contactContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-contact > .section-content > table.table > tbody > tr',(els)=>els.map(el=>({
                        name:el.querySelector('td:first-child').innerText,
                        content:el.querySelector('td:last-child').innerText
                    })))
                    detailData.contact={
                        header:contactHeader,
                        content:contactContent
                    }

                    console.log(detailData.contact);

                    //cào thông tin đặc điểm tin đăng



                    await pageDetail.close()
                    console.log(' >> close tab'+link);
                    resolve()

                } catch (error) {
                    console.log('lấy data detail lỗi: '+error.message);
                    reject(error)
                }
            })
            for(let link of detailLinks){
                await scraperDetail(link)
            }
            //close tap
            await browser.close()
            console.log('>>tab đã close');
            resolve()
        } catch (error) {
            console.log('lỗi ở scraper'+error)
            reject(error)
        }
    }
})

module.exports = {
    scrapeCategory,
    scraper
}