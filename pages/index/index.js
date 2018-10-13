//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    backImg:'../../images/back.jpg',
    nowweatherImg: '../../images/131.png',
    cityname: "北京",
    weekday: "更新日期",
    weatherinfo: "暴雨",
    //温度
    nowtemp: 17,
    //空气质量
    pmvalue:50,
    //风向
    winddir:"北风",
    //风力
    windsc:"X",
    //体感温度
    feeltmp:10,
    //相对湿度
    hum:30,
    forecastData: [null, null, null]
  },
  // 下拉刷新
  onPullDownRefresh: function(){
      console.log('在刷新！');
      this.onLoad();
  },
  
  onLoad: function () {
    var that = this;
    //1、使用微信获取地理位置（经纬度）
    //2、向腾讯发出网络请求，提交经纬度，并获取城市信息
    //3、向和风发起网络请求，提交城市信息，获取天气预报
 
    //获取缓存数据,不需要带大括号
    that.setData(wx.getStorageSync('data'))
    
    //利用Promise类将三个异步方法顺序执行
    this.getLocation().then(this.getCity).then(this.getWeatherInfo).then(this.getForsecast);
  },

  //获得未来三天的天气状况
  getForsecast: function(){
    var that = this;
    return new Promise(function(done){
      wx.request({
        url: 'https://free-api.heweather.com/s6/weather/forecast?location=' + that.data.cityname + '&key=289eb322373d499890558a037ee1d816',
        success: function(res){
          that.setData({
            forecastData: res.data.HeWeather6[0].daily_forecast,
          })
        }
      })
    });
  },
  //得到城市经纬度
  getLocation: function(){
    //将异步方法按顺序执行
     return new Promise(function(done){
       //1、获取地理位置信息
       wx.getLocation({
         type: 'wgs84',
         success: function (res) {
           // 取出经纬度
           var latitude = res.latitude;
           var longitude = res.longitude;
           console.log(latitude, longitude, "经纬度");
           //发出消息表示已完成，并把获取的结果发出去
           done(latitude + ',' + longitude);
           }
         });
     });
  },
  //得到城市名称
  getCity: function(data){
     return new Promise(function(done){
       //2、向腾讯发出网络请求，提交经纬度，并获取城市信息
       wx.request({
         //关于为什么这个url包含的网址用`，因为url里包含了变量
         url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + data + '&key=WV7BZ-IPMK2-PSLU2-C63EH-7FBMF-TTBX3',
         //请求成功
         success: function (locinfo) {
           console.log(locinfo, "地址信息");
           let cityname = locinfo.data.result.address_component.city;
           console.log(cityname, "城市名字");
           //发出消息。传给下一个人
           done(cityname);
         }
     });
  });
 },
 //得到城市天气状况
  getWeatherInfo: function(data){
       var that = this;
       return new Promise(function(done){
         //3、向和风发起网络请求，提交城市信息，获取天气预报
         wx.request({
           url: 'https://free-api.heweather.com/s6/weather/now?key=289eb322373d499890558a037ee1d816&location=' + data,
           success: function (weatherinfo) {
             console.log(weatherinfo, "对应城市的天气信息");
             //修改页面上的城市信息
             that.setData({
               cityname: weatherinfo.data.HeWeather6[0].basic.location,
               weatherinfo: weatherinfo.data.HeWeather6[0].now.cond_txt,
               weekday: weatherinfo.data.HeWeather6[0].update.loc,
               nowweatherImg: "../../images/" + weatherinfo.data.HeWeather6[0].now.cond_code + '.png',
               backImg: '../../images/' + weatherinfo.data.HeWeather6[0].now.cond_code + '.jpg',

               nowtemp: weatherinfo.data.HeWeather6[0].now.tmp,
               winddir: weatherinfo.data.HeWeather6[0].now.wind_dir,
               windsc: weatherinfo.data.HeWeather6[0].now.wind_sc,
               feeltmp: weatherinfo.data.HeWeather6[0].now.fl,
               hum: weatherinfo.data.HeWeather6[0].now.hum
             })
           }
         }),
         //设置缓存,键值对
           wx.setStorageSync('data', 'that.data');

           done();
           //请求空气质量
           wx.request({
             url: 'https://free-api.heweather.com/s6/air/now?location=' + cityname + '&key=1790454674ca4af890312094cec23c95',
             success: function (airqulity) {
               console.log(airqulity.data.HeWeather6[0].air_now_city.pm25, "对应城市的空气质量");
               var pm25 = airqulity.data.HeWeather6[0].air_now_city.pm25;
               that.setData({
                 pmvalue: pm25,
               })
             }
         })
      });
  }
})
