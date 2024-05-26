
//tạo ra browser intance
const puppeteer= require('puppeteer')
const startBrowser=async ()=>{
    let browser 
    try {
        browser= await puppeteer.launch({
            // có hiện ui của chrom hay không, false là có
            headless:true,
            //Chrom sẽ sử dụng multiple layers của sandbox để tránh những nội dung web không đáng tin,
            // nếu tin tưởng content dùng thì set như này
            args: ['--disable-setuid-sandbox'],
            // try cập website bỏ qua các lỗi liên quan đến http security
            'ignoreHTTPSErrors':true
        })
    } catch (error) {
        console.log('khong tao duoc browser'+error.message);
    }
    return browser
}

module.exports= startBrowser